import { useRef, useState, useMemo, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";

export interface D20Ref {
  roll: () => void;
}

const FACES = Array.from({ length: 20 }, (_, i) => i + 1);

function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

function createFaceLabelTexture(number: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#E7E1AF";
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, size - 8, size - 8);

  ctx.fillStyle = "#1a1a2e";
  ctx.font = "bold 64px Courier Prime, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(number), size / 2, size / 2 + 4);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface FaceData {
  normal: THREE.Vector3;
  centroid: THREE.Vector3;
}

function buildIcosahedronData() {
  const geometry = new THREE.IcosahedronGeometry(1, 0);
  const pos = geometry.attributes.position;
  const faces: FaceData[] = [];

  for (let i = 0; i < pos.count; i += 3) {
    const a = new THREE.Vector3().fromBufferAttribute(pos, i);
    const b = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
    const c = new THREE.Vector3().fromBufferAttribute(pos, i + 2);

    const normal = new THREE.Vector3()
      .crossVectors(new THREE.Vector3().subVectors(b, a), new THREE.Vector3().subVectors(c, a))
      .normalize();
    const centroid = new THREE.Vector3().addVectors(a, b).add(c).divideScalar(3);

    faces.push({ normal, centroid });
  }

  return { geometry, faces };
}

function FaceLabels({ faces }: { faces: FaceData[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((sprite) => {
      sprite.lookAt(camera.position);
    });
  });

  const textures = useMemo(() => FACES.map((n) => createFaceLabelTexture(n)), []);

  return (
    <group ref={groupRef}>
      {faces.map((face, i) => (
        <sprite
          key={i}
          position={face.centroid.clone().add(face.normal.clone().multiplyScalar(0.06))}
          scale={[0.42, 0.42, 0.42]}
        >
          <spriteMaterial map={textures[i]} transparent depthTest={false} />
        </sprite>
      ))}
    </group>
  );
}

interface RollSpec {
  value: number;
  key: number;
}

function DiceScene({
  rollSpec,
  onRollingChange,
  onResult,
}: {
  rollSpec: RollSpec | null;
  onRollingChange?: (rolling: boolean) => void;
  onResult?: (value: number) => void;
}) {
  const dieRef = useRef<THREE.Mesh>(null);
  const { geometry, faces } = useMemo(buildIcosahedronData, []);
  const [rolling, setRolling] = useState(false);
  const lastRollKey = useRef<number | null>(null);

  const targetQ = useRef(new THREE.Quaternion());
  const startQ = useRef(new THREE.Quaternion());
  const rollStartTime = useRef(0);
  const rollDuration = useRef(0);
  const pendingResult = useRef<number | null>(null);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#E7E1AF",
        roughness: 0.45,
        metalness: 0.15,
        flatShading: true,
      }),
    []
  );

  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  useEffect(() => {
    if (!rollSpec || !dieRef.current) return;
    if (rolling) return;
    if (lastRollKey.current === rollSpec.key) return;
    lastRollKey.current = rollSpec.key;

    const value = rollSpec.value;
    const index = value - 1;
    const faceNormal = faces[index].normal.clone();

    startQ.current.copy(dieRef.current.quaternion);

    const alignToCamera = new THREE.Quaternion().setFromUnitVectors(faceNormal, new THREE.Vector3(0, 0, 1));
    const randomSpins = new THREE.Euler(
      (Math.floor(Math.random() * 3) + 3) * Math.PI * (Math.random() > 0.5 ? 1 : -1),
      (Math.floor(Math.random() * 3) + 3) * Math.PI * (Math.random() > 0.5 ? 1 : -1),
      (Math.floor(Math.random() * 2) + 2) * Math.PI * (Math.random() > 0.5 ? 1 : -1)
    );
    const spinQ = new THREE.Quaternion().setFromEuler(randomSpins);

    targetQ.current.copy(alignToCamera).multiply(spinQ);

    pendingResult.current = value;
    setRolling(true);
    onRollingChange?.(true);
    rollStartTime.current = performance.now();
    rollDuration.current = 1800 + Math.random() * 600;
  }, [rollSpec, rolling, faces, onRollingChange]);

  useFrame(() => {
    if (!dieRef.current) return;

    if (!rolling) {
      dieRef.current.rotation.z += 0.002;
      return;
    }

    const elapsed = performance.now() - rollStartTime.current;
    const t = Math.min(elapsed / rollDuration.current, 1);
    const eased = 1 - Math.pow(1 - t, 4);

    dieRef.current.quaternion.copy(startQ.current).slerp(targetQ.current, eased);

    if (t >= 1) {
      dieRef.current.quaternion.copy(targetQ.current);
      setRolling(false);
      onRollingChange?.(false);
      if (pendingResult.current !== null) {
        onResult?.(pendingResult.current);
        pendingResult.current = null;
      }
    }
  });

  return (
    <group rotation={[0.3, 0.4, 0]}>
      <mesh ref={dieRef} material={material} geometry={geometry} castShadow receiveShadow>
        <lineSegments geometry={edgesGeometry}>
          <lineBasicMaterial color="#1a1a2e" linewidth={2} />
        </lineSegments>
      </mesh>
      <FaceLabels faces={faces} />
    </group>
  );
}

const D20 = forwardRef<D20Ref, { className?: string }>(function D20(
  { className }: { className?: string },
  ref
) {
  const [rollSpec, setRollSpec] = useState<RollSpec | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const keyRef = useRef(0);

  const triggerRoll = useCallback(() => {
    if (isRolling) return;
    keyRef.current += 1;
    setResult(null);
    setRollSpec({ value: rollD20(), key: keyRef.current });
  }, [isRolling]);

  useImperativeHandle(ref, () => ({ roll: triggerRoll }), [triggerRoll]);

  return (
    <div
      className={
        className ||
        "drop-shadow-[3px_1px_1.25px_rgba(0,0,0,0.6),-1px_-2px_1.5px_rgba(0,0,0,0.6)] h-[89px] relative w-[85px]"
      }
      data-name="D20"
      aria-label="Roll a D20"
    >
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 6, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-4, -2, 3]} intensity={0.6} />
        <DiceScene
          rollSpec={rollSpec}
          onRollingChange={setIsRolling}
          onResult={(value) => setResult(value)}
        />
      </Canvas>

      <AnimatePresence>
        {result !== null && !isRolling && (
          <motion.div
            key={result}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-[#e7e1af] border-2 border-black rounded-full h-12 w-12 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-black font-['Courier_Prime']">{result}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default D20;
