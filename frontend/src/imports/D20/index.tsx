import { useRef, useState, useMemo, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/app/context/ThemeContext";

export interface D20Ref {
  roll: () => void;
}

function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

function cssVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function createFaceTexture(number: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const m = 8;
  const x1 = size / 2;
  const y1 = size - m;
  const x2 = size - m;
  const y2 = m;
  const x3 = m;
  const y3 = m;

  const ink = cssVar("--flowty-ink", "#1a1a2e");
  const paper = cssVar("--flowty-surface", "#E1DBAA");

  ctx.fillStyle = ink;
  ctx.fillRect(0, 0, size, size);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fillStyle = ink;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = ink;
  ctx.stroke();

  const bevel = 10;
  const cx = (x1 + x2 + x3) / 3;
  const cy = (y1 + y2 + y3) / 3;
  const d1 = Math.sqrt((x1 - cx) ** 2 + (y1 - cy) ** 2);
  const d2 = Math.sqrt((x2 - cx) ** 2 + (y2 - cy) ** 2);
  const d3 = Math.sqrt((x3 - cx) ** 2 + (y3 - cy) ** 2);
  const s1 = 1 - bevel * 0.86 / d1;
  const s2 = 1 - bevel * 0.86 / d2;
  const s3 = 1 - bevel * 0.86 / d3;
  const ix1 = cx + (x1 - cx) * s1;
  const iy1 = cy + (y1 - cy) * s1;
  const ix2 = cx + (x2 - cx) * s2;
  const iy2 = cy + (y2 - cy) * s2;
  const ix3 = cx + (x3 - cx) * s3;
  const iy3 = cy + (y3 - cy) * s3;

  ctx.beginPath();
  ctx.moveTo(ix1, iy1);
  ctx.lineTo(ix2, iy2);
  ctx.lineTo(ix3, iy3);
  ctx.closePath();
  ctx.fillStyle = paper;
  ctx.fill();
  ctx.strokeStyle = "rgba(26, 26, 46, 0.22)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 52px 'Courier Prime', 'Courier New', monospace";

  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  ctx.fillText(String(number), cx + 1.5, cy + 2);

  ctx.fillStyle = ink;
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
  /** Direction in the face plane where the printed number's "up" points. */
  up: THREE.Vector3;
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

    // UVs are (0.5,0), (1,1), (0,1) for a,b,c. The texture's "up" (v+)
    // direction in the face plane points from the UV centroid toward the
    // midpoint of the top edge (uv (0,1)-(1,1)), i.e. b+c over 2.
    const uvCentroid = new THREE.Vector3(0.5, 2 / 3, 0);
    const uvTopMid = new THREE.Vector3(0.5, 1, 0);
    const e1 = new THREE.Vector3().subVectors(b, a);
    const e2 = new THREE.Vector3().subVectors(c, a);
    // Solve uv offset as a combination of the 3D edge vectors.
    const duv = new THREE.Vector2().subVectors(
      new THREE.Vector2(uvTopMid.x, uvTopMid.y),
      new THREE.Vector2(uvCentroid.x, uvCentroid.y)
    );
    const uvA = new THREE.Vector2(0.5, 0);
    const uvB = new THREE.Vector2(1, 1);
    const uvC = new THREE.Vector2(0, 1);
    const dB = new THREE.Vector2().subVectors(uvB, uvA);
    const dC = new THREE.Vector2().subVectors(uvC, uvA);
    const det = dB.x * dC.y - dB.y * dC.x;
    const s = (duv.x * dC.y - duv.y * dC.x) / det;
    const t = (dB.x * duv.y - dB.y * duv.x) / det;
    const up = new THREE.Vector3()
      .addScaledVector(e1, s)
      .addScaledVector(e2, t)
      .normalize();

    faces.push({ normal, up });

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

function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

interface RollSpec {
  value: number;
  key: number;
}

// Tilt applied after alignment so the winning face leans toward the camera
// instead of pointing straight up (camera sits at (0, 1.9, 3.4)).
const FACE_TILT_TOWARD_CAMERA = Math.atan2(3.4, 1.9) - Math.PI / 12;

function DiceScene({
  rollSpec,
  onRollingChange,
}: {
  rollSpec: RollSpec | null;
  onRollingChange?: (rolling: boolean) => void;
}) {
  const dieRef = useRef<THREE.Group>(null);
  const { theme } = useTheme();
  const { meshes, faces } = useMemo(buildDieFaces, [theme]);
  const [rolling, setRolling] = useState(false);
  const lastRollKey = useRef<number | null>(null);

  // Free GPU resources for the previous theme's textures/materials.
  useEffect(() => {
    return () => {
      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.map?.dispose();
        mat.dispose();
      });
    };
  }, [meshes]);

  // World "up": the winning face rests flat, facing upward.
  const upDir = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  const targetQ = useRef(new THREE.Quaternion());
  const startQ = useRef(new THREE.Quaternion());
  const startPos = useRef(new THREE.Vector3());
  const targetPos = useRef(new THREE.Vector3());
  const rollStartTime = useRef(0);
  const rollDuration = useRef(0);

  useEffect(() => {
    if (!rollSpec || !dieRef.current) return;
    if (rolling) return;
    if (lastRollKey.current === rollSpec.key) return;
    lastRollKey.current = rollSpec.key;

    const value = rollSpec.value;
    const index = value - 1;
    const faceNormal = faces[index].normal.clone();

    // Start from a chaotic random orientation so the die visibly tumbles.
    startQ.current
      .setFromEuler(
        new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        )
      )
      .normalize();

    const offsetX = (Math.random() - 0.5) * 1.2;
    const offsetZ = (Math.random() - 0.5) * 0.8;
    const startY = 2.6 + Math.random() * 1.2;
    dieRef.current.position.set(offsetX, startY, offsetZ);
    startPos.current.set(offsetX, startY, offsetZ);
    targetPos.current.set(0, 0, 0);

    // Align the winning face's normal straight up so the die rests flat
    // with the rolled number on top, then yaw around Y so the number's
    // upright direction faces the camera (readable, not rotated), and
    // finally tilt the face toward the camera so it is clearly visible
    // without the user having to look from directly above.
    const alignUp = new THREE.Quaternion().setFromUnitVectors(
      faceNormal,
      upDir
    );

    // After alignUp, rotate around world Y so the number's up direction
    // points toward +Z (toward the camera).
    const upWorld = faces[index].up.clone().applyQuaternion(alignUp);
    const yaw = Math.atan2(upWorld.x, upWorld.z);
    const yawQ = new THREE.Quaternion().setFromAxisAngle(upDir, -yaw);

    const aligned = yawQ.multiply(alignUp);

    const tiltQ = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      FACE_TILT_TOWARD_CAMERA
    );
    const presented = tiltQ.multiply(aligned);

    // Several full spins around a random axis so the die tumbles before settling.
    const spinAxis = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ).normalize();
    const spinCount = Math.floor(Math.random() * 3) + 3;
    const spin = new THREE.Quaternion().setFromAxisAngle(
      spinAxis,
      spinCount * Math.PI * 2 * (Math.random() > 0.5 ? 1 : -1) + (Math.random() - 0.5) * Math.PI
    );

    targetQ.current.copy(spin).multiply(presented);

    setRolling(true);
    onRollingChange?.(true);
    rollStartTime.current = performance.now();
    rollDuration.current = 1500 + Math.random() * 400;
  }, [rollSpec, rolling, faces, onRollingChange, upDir]);

  useFrame(() => {
    if (!dieRef.current) return;

    if (!rolling) return;

    const elapsed = performance.now() - rollStartTime.current;
    const t = Math.min(elapsed / rollDuration.current, 1);

    // Tumbling: fast at first, decelerating into the final orientation.
    const eased = 1 - Math.pow(1 - t, 4);
    const wobble = 0.1 * Math.sin(t * Math.PI * 5) * (1 - t);
    const slerpT = Math.max(0, Math.min(1, eased + wobble));
    dieRef.current.quaternion.copy(startQ.current).slerp(targetQ.current, slerpT);

    // Bouncing ball drop: falls, bounces a few times, then rests.
    const bounceT = easeOutBounce(t);
    const y = startPos.current.y + (targetPos.current.y - startPos.current.y) * bounceT;
    const x = startPos.current.x + (targetPos.current.x - startPos.current.x) * eased;
    const z = startPos.current.z + (targetPos.current.z - startPos.current.z) * eased;
    dieRef.current.position.set(x, y, z);

    if (t >= 1) {
      dieRef.current.quaternion.copy(targetQ.current);
      dieRef.current.position.copy(targetPos.current);
      setRolling(false);
      onRollingChange?.(false);
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
  const [settledValue, setSettledValue] = useState<number | null>(null);
  const keyRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload the roll sound on mount so it's ready when the user clicks.
  useEffect(() => {
    const audio = new Audio("/audio/D20Roll.mp3");
    audio.preload = "auto";
    audioRef.current = audio;
  }, []);

  const triggerRoll = useCallback(() => {
    if (isRolling) return;
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((err) => console.warn("D20 audio play failed:", err));
    }
    keyRef.current += 1;
    setSettledValue(null);
    setRollSpec({ value: rollD20(), key: keyRef.current });
  }, [isRolling]);

  const handleRollingChange = useCallback(
    (rolling: boolean) => {
      setIsRolling(rolling);
      if (!rolling) setSettledValue(rollSpec?.value ?? null);
    },
    [rollSpec]
  );

  useImperativeHandle(ref, () => ({ roll: triggerRoll }), [triggerRoll]);

  return (
    <div
      onClick={triggerRoll}
      className={
        className ||
        "drop-shadow-[3px_1px_1.25px_rgba(0,0,0,0.6),-1px_-2px_1.5px_rgba(0,0,0,0.6)] cursor-pointer h-[178px] relative w-[170px]"
      }
      data-name="D20"
      aria-label="Roll a D20"
    >
      <Canvas
        camera={{ position: [0, 1.9, 3.4], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[3, 5, 4]} intensity={1.5} castShadow />
        <directionalLight position={[-3, -0.5, 2]} intensity={0.5} />
        <DiceScene rollSpec={rollSpec} onRollingChange={handleRollingChange} />
      </Canvas>

      {/* Floating result bubble so the rolled value is readable at a glance. */}
      {settledValue !== null && (
        <div
          key={rollSpec?.key}
          className="pointer-events-none absolute left-1/2 top-[6px] -translate-x-1/2 bg-[var(--flowty-paper)] border-[var(--flowty-ink)] border-[1.5px] border-solid rounded-[6px] px-[8px] py-[2px] font-['VT323:Regular',sans-serif] text-[22px] leading-none text-[var(--flowty-ink)]"
          style={{
            boxShadow: "2px 2px 0 var(--flowty-shadow-stamp)",
            animation: "d20-pop-in 240ms ease-out",
          }}
        >
          {settledValue}
        </div>
      )}
    </div>
  );
});

export default D20;