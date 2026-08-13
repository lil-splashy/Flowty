import { useRef, useState, useMemo, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";

export interface D20Ref {
  roll: () => void;
}

function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

function createFaceTexture(number: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#E7E1AF";
  ctx.fillRect(0, 0, size, size);

  const m = 8;
  ctx.beginPath();
  ctx.moveTo(size / 2, size - m);
  ctx.lineTo(size - m, m);
  ctx.lineTo(m, m);
  ctx.closePath();
  ctx.fillStyle = "#E1DBAA";
  ctx.fill();
  ctx.strokeStyle = "rgba(26, 26, 46, 0.22)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const cx = size / 2;
  const cy = (size - m + m + m) / 3 + 3;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 52px 'Courier Prime', 'Courier New', monospace";

  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  ctx.fillText(String(number), cx + 1.5, cy + 2);

  ctx.fillStyle = "#1a1a2e";
  ctx.fillText(String(number), cx, cy);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function createTriangleGeometry(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array([a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z]), 3)
  );
  geometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array([0.5, 0, 1, 1, 0, 1]), 2)
  );
  geometry.setIndex([0, 1, 2]);
  geometry.computeVertexNormals();
  return geometry;
}

interface FaceData {
  normal: THREE.Vector3;
}

function buildDieFaces(): { meshes: THREE.Mesh[]; faces: FaceData[] } {
  const source = new THREE.IcosahedronGeometry(1, 0);
  const pos = source.attributes.position;
  const meshes: THREE.Mesh[] = [];
  const faces: FaceData[] = [];

  for (let i = 0; i < pos.count; i += 3) {
    const a = new THREE.Vector3().fromBufferAttribute(pos, i);
    const b = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
    const c = new THREE.Vector3().fromBufferAttribute(pos, i + 2);

    const normal = new THREE.Vector3()
      .crossVectors(new THREE.Vector3().subVectors(b, a), new THREE.Vector3().subVectors(c, a))
      .normalize();
    faces.push({ normal });

    const number = i / 3 + 1;
    const material = new THREE.MeshStandardMaterial({
      map: createFaceTexture(number),
      roughness: 0.42,
      metalness: 0.05,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(createTriangleGeometry(a, b, c), material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    meshes.push(mesh);
  }

  return { meshes, faces };
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
  const dieRef = useRef<THREE.Group>(null);
  const { meshes, faces } = useMemo(buildDieFaces, []);
  const [rolling, setRolling] = useState(false);
  const lastRollKey = useRef<number | null>(null);

  const targetQ = useRef(new THREE.Quaternion());
  const startQ = useRef(new THREE.Quaternion());
  const startPos = useRef(new THREE.Vector3());
  const targetPos = useRef(new THREE.Vector3());
  const rollStartTime = useRef(0);
  const rollDuration = useRef(0);
  const pendingResult = useRef<number | null>(null);

  useEffect(() => {
    if (!rollSpec || !dieRef.current) return;
    if (rolling) return;
    if (lastRollKey.current === rollSpec.key) return;
    lastRollKey.current = rollSpec.key;

    const value = rollSpec.value;
    const index = value - 1;
    const faceNormal = faces[index].normal.clone();

    startQ.current.copy(dieRef.current.quaternion);

    const offsetX = (Math.random() - 0.5) * 0.5;
    const offsetZ = (Math.random() - 0.5) * 0.4;
    dieRef.current.position.set(offsetX, 0, offsetZ);
    startPos.current.set(offsetX, 0, offsetZ);
    targetPos.current.set(0, 0, 0);

    const alignUp = new THREE.Quaternion().setFromUnitVectors(faceNormal, new THREE.Vector3(0, 1, 0));
    const randomSpins = new THREE.Euler(
      (Math.floor(Math.random() * 3) + 3) * Math.PI * (Math.random() > 0.5 ? 1 : -1),
      (Math.floor(Math.random() * 3) + 3) * Math.PI * (Math.random() > 0.5 ? 1 : -1),
      0
    );
    const spinQ = new THREE.Quaternion().setFromEuler(randomSpins);

    targetQ.current.copy(alignUp).multiply(spinQ);

    pendingResult.current = value;
    setRolling(true);
    onRollingChange?.(true);
    rollStartTime.current = performance.now();
    rollDuration.current = 1800 + Math.random() * 600;
  }, [rollSpec, rolling, faces, onRollingChange]);

  useFrame(() => {
    if (!dieRef.current) return;

    if (!rolling) {
      const idleSpin = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.003);
      dieRef.current.quaternion.premultiply(idleSpin);
      return;
    }

    const elapsed = performance.now() - rollStartTime.current;
    const t = Math.min(elapsed / rollDuration.current, 1);
    const eased = 1 - Math.pow(1 - t, 4);

    dieRef.current.quaternion.copy(startQ.current).slerp(targetQ.current, eased);
    dieRef.current.position.lerpVectors(startPos.current, targetPos.current, eased);

    if (t >= 1) {
      dieRef.current.quaternion.copy(targetQ.current);
      dieRef.current.position.copy(targetPos.current);
      setRolling(false);
      onRollingChange?.(false);
      if (pendingResult.current !== null) {
        onResult?.(pendingResult.current);
        pendingResult.current = null;
      }
    }
  });

  return (
    <>
      <mesh position={[0, -1.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.72, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.25} />
      </mesh>
      <group ref={dieRef}>
        {meshes.map((mesh, i) => (
          <primitive key={i} object={mesh} />
        ))}
      </group>
    </>
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
      onClick={triggerRoll}
      className={
        className ||
        "drop-shadow-[3px_1px_1.25px_rgba(0,0,0,0.6),-1px_-2px_1.5px_rgba(0,0,0,0.6)] cursor-pointer h-[89px] relative w-[85px]"
      }
      data-name="D20"
      aria-label="Roll a D20"
    >
      <Canvas
        camera={{ position: [0, 1.8, 3.0], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[3, 5, 4]} intensity={1.5} castShadow />
        <directionalLight position={[-3, -0.5, 2]} intensity={0.5} />
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
