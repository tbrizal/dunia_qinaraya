import { Fragment } from "react";
import { villageLayout } from "./villageLayout";
import type { BuildingSpec } from "./villageLayout";

const STONE = "#a9a79b";
const WOOD = "#6b4a32";
const GLOW = "#f3d98b";

function faceRotation(spec: BuildingSpec): number {
  return spec.facing === "north" ? Math.PI : 0;
}

/** Atap limas persegi panjang. Group diskalakan setelah mesh diputar agar tetap berbentuk persegi panjang. */
function Roof({ halfW, halfD, baseY, height, color }: { halfW: number; halfD: number; baseY: number; height: number; color: string }) {
  return (
    <group position={[0, baseY, 0]} scale={[halfW + 0.35, height, halfD + 0.35]}>
      <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[Math.SQRT2, 1, 4]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
}

function House({ spec }: { spec: BuildingSpec }) {
  const hw = spec.width / 2;
  const hd = spec.depth / 2;
  const wallH = 2.4;
  return (
    <group position={[spec.x, 0, spec.z]} rotation={[0, faceRotation(spec), 0]}>
      <mesh position={[0, wallH / 2, 0]}>
        <boxGeometry args={[spec.width, wallH, spec.depth]} />
        <meshStandardMaterial color={spec.wall} flatShading />
      </mesh>
      <Roof halfW={hw} halfD={hd} baseY={wallH} height={1.7} color={spec.roof} />
      <mesh position={[hw * 0.45, wallH + 1.0, -hd * 0.3]}>
        <boxGeometry args={[0.5, 1.2, 0.5]} />
        <meshStandardMaterial color={STONE} flatShading />
      </mesh>
      <mesh position={[0, 0.85, hd + 0.02]}>
        <boxGeometry args={[0.9, 1.7, 0.06]} />
        <meshStandardMaterial color={WOOD} flatShading />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * hw * 0.6, 1.5, hd + 0.02]}>
          <boxGeometry args={[0.7, 0.7, 0.06]} />
          <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={0.25} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/** Masjid placeholder: aula, kubah, dan menara. Bentuk final dan detail menyusul pada fase aset. */
function Mosque({ spec }: { spec: BuildingSpec }) {
  const hw = spec.width / 2;
  const hd = spec.depth / 2;
  const hallH = 4.2;
  return (
    <group position={[spec.x, 0, spec.z]} rotation={[0, faceRotation(spec), 0]}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[spec.width + 0.4, 0.5, spec.depth + 0.4]} />
        <meshStandardMaterial color="#c9b58a" flatShading />
      </mesh>
      <mesh position={[0, hallH / 2, 0]}>
        <boxGeometry args={[spec.width, hallH, spec.depth]} />
        <meshStandardMaterial color={spec.wall} flatShading />
      </mesh>
      <mesh position={[0, hallH, 0]}>
        <sphereGeometry args={[2.7, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={spec.roof} flatShading />
      </mesh>
      <mesh position={[0, hallH + 2.7 + 0.25, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.6, 6]} />
        <meshStandardMaterial color="#d9b44a" flatShading />
      </mesh>
      <mesh position={[0, 1.4, hd + 0.03]}>
        <boxGeometry args={[1.8, 2.8, 0.08]} />
        <meshStandardMaterial color="#2f4a3a" flatShading />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 3.2, 2.3, hd + 0.03]}>
          <boxGeometry args={[0.9, 1.8, 0.08]} />
          <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={0.25} flatShading />
        </mesh>
      ))}
      <group position={[hw + 1.3, 0, -hd + 1.2]}>
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[0.55, 0.7, 8, 10]} />
          <meshStandardMaterial color={spec.wall} flatShading />
        </mesh>
        <mesh position={[0, 7.4, 0]}>
          <cylinderGeometry args={[0.95, 0.95, 0.25, 10]} />
          <meshStandardMaterial color="#c9b58a" flatShading />
        </mesh>
        <mesh position={[0, 8.7, 0]}>
          <coneGeometry args={[0.7, 1.5, 10]} />
          <meshStandardMaterial color={spec.roof} flatShading />
        </mesh>
      </group>
    </group>
  );
}

/** Kios pasar: meja, empat tiang, dan kanopi bergaris. */
function Stall({ spec }: { spec: BuildingSpec }) {
  const hw = spec.width / 2;
  const hd = spec.depth / 2;
  const stripes = 6;
  const canopyW = spec.width + 0.4;
  const stripeW = canopyW / stripes;
  return (
    <group position={[spec.x, 0, spec.z]} rotation={[0, faceRotation(spec), 0]}>
      <mesh position={[0, 0.45, -hd * 0.25]}>
        <boxGeometry args={[spec.width - 0.3, 0.9, spec.depth * 0.5]} />
        <meshStandardMaterial color={spec.wall} flatShading />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * (hw - 0.1), 1.15, sz * (hd - 0.1)]}>
            <cylinderGeometry args={[0.07, 0.07, 2.3, 6]} />
            <meshStandardMaterial color={WOOD} flatShading />
          </mesh>
        )),
      )}
      {Array.from({ length: stripes }, (_, i) => (
        <mesh key={i} position={[-canopyW / 2 + stripeW * (i + 0.5), 2.4, 0]}>
          <boxGeometry args={[stripeW, 0.14, spec.depth + 0.5]} />
          <meshStandardMaterial color={i % 2 === 0 ? spec.roof : "#f0e2c0"} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/** Musala placeholder: bangunan kecil dengan kubah mungil. */
function Musala({ spec }: { spec: BuildingSpec }) {
  const hd = spec.depth / 2;
  const wallH = 3;
  return (
    <group position={[spec.x, 0, spec.z]} rotation={[0, faceRotation(spec), 0]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[spec.width + 0.3, 0.4, spec.depth + 0.3]} />
        <meshStandardMaterial color="#c9b58a" flatShading />
      </mesh>
      <mesh position={[0, wallH / 2, 0]}>
        <boxGeometry args={[spec.width, wallH, spec.depth]} />
        <meshStandardMaterial color={spec.wall} flatShading />
      </mesh>
      <mesh position={[0, wallH, 0]}>
        <sphereGeometry args={[1.6, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={spec.roof} flatShading />
      </mesh>
      <mesh position={[0, 1.2, hd + 0.03]}>
        <boxGeometry args={[1.3, 2.2, 0.08]} />
        <meshStandardMaterial color="#2f4a3a" flatShading />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.7, 1.9, hd + 0.03]}>
          <boxGeometry args={[0.7, 1.1, 0.08]} />
          <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={0.25} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/** Tempat wudu: bak batu rendah dengan tiga keran dan peneduh kayu. */
function WuduStation({ spec }: { spec: BuildingSpec }) {
  const hw = spec.width / 2;
  const hd = spec.depth / 2;
  return (
    <group position={[spec.x, 0, spec.z]} rotation={[0, faceRotation(spec), 0]}>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[spec.width, 0.7, spec.depth]} />
        <meshStandardMaterial color={spec.wall} flatShading />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[spec.width - 0.2, 0.05, spec.depth - 0.2]} />
        <meshStandardMaterial color="#5fa3c0" />
      </mesh>
      {[-0.7, 0, 0.7].map((x) => (
        <mesh key={x} position={[x, 1.0, hd - 0.1]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 6]} />
          <meshStandardMaterial color="#9a9a9a" flatShading />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (hw - 0.05), 1.3, -hd + 0.1]}>
          <boxGeometry args={[0.1, 1.2, 0.1]} />
          <meshStandardMaterial color={WOOD} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 1.95, -hd + 0.1]}>
        <boxGeometry args={[spec.width + 0.5, 0.1, 0.9]} />
        <meshStandardMaterial color={spec.roof} flatShading />
      </mesh>
    </group>
  );
}

function Well({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.95, 1.0, 0.8, 14]} />
        <meshStandardMaterial color={STONE} flatShading />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 14]} />
        <meshStandardMaterial color="#5fa3c0" />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.9, 1.55, 0]}>
          <boxGeometry args={[0.12, 1.5, 0.12]} />
          <meshStandardMaterial color={WOOD} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 2.35, 0]}>
        <boxGeometry args={[2.3, 0.14, 1]} />
        <meshStandardMaterial color="#8a5a3a" flatShading />
      </mesh>
    </group>
  );
}

export function Buildings() {
  const { buildings, well } = villageLayout;
  return (
    <>
      {buildings.map((spec) => (
        <Fragment key={spec.id}>
          {spec.kind === "house" && <House spec={spec} />}
          {spec.kind === "mosque" && <Mosque spec={spec} />}
          {spec.kind === "stall" && <Stall spec={spec} />}
          {spec.kind === "musala" && <Musala spec={spec} />}
          {spec.kind === "wudu" && <WuduStation spec={spec} />}
        </Fragment>
      ))}
      <Well x={well.x} z={well.z} />
    </>
  );
}
