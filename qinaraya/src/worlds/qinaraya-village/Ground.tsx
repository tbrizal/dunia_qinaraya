import { gameConfig } from "../../config/gameConfig";
import { villageLayout } from "./villageLayout";

const GRASS = "#86a864";

/** Tanah, jalan, plaza, dan petak kebun. Lapisan ditumpuk tipis dengan polygonOffset agar tidak berkedip. */
export function Ground() {
  const { roads, plaza, gardenPlots, patches } = villageLayout;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[gameConfig.scene.groundSize, gameConfig.scene.groundSize]} />
        <meshStandardMaterial color={GRASS} />
      </mesh>

      {patches.map((p, i) => (
        <mesh key={`patch-${i}`} position={[p.x, 0.01, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[p.radius, 20]} />
          <meshStandardMaterial
            color={p.light ? "#93b46e" : "#779a58"}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>
      ))}

      {roads.map((r, i) => (
        <mesh key={`road-${i}`} position={[r.cx, 0.02, r.cz]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[r.w, r.d]} />
          <meshStandardMaterial color="#cdb88c" polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
        </mesh>
      ))}

      <mesh position={[plaza.x, 0.03, plaza.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[plaza.radius, 40]} />
        <meshStandardMaterial color="#dccfa8" polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-3} />
      </mesh>

      {gardenPlots.map((p, i) => (
        <mesh key={`plot-${i}`} position={[p.cx, 0.08, p.cz]}>
          <boxGeometry args={[p.w, 0.16, p.d]} />
          <meshStandardMaterial color="#5e4630" flatShading />
        </mesh>
      ))}
    </group>
  );
}
