import { getCropDef } from "../../data/crops";
import type { CropDef } from "../../data/crops";
import { useFarmStore } from "../../stores/useFarmStore";
import { getGrowthProgress, isWet } from "../../systems/farming/farmPlot";
import type { FarmPlot } from "../../systems/farming/farmPlot";
import { villageLayout } from "./villageLayout";
import type { PlotSpec } from "./villageLayout";

const SOIL_HEIGHT = 0.16;

/** Kunci visual: komponen hanya digambar ulang saat tampilan petak benar-benar berubah. */
function visualKey(plot: FarmPlot | undefined): string {
  if (!plot) return "none";
  return `${plot.status}|${plot.cropId ?? ""}|${Math.floor(getGrowthProgress(plot) * 8)}|${isWet(plot) ? 1 : 0}`;
}

function Plant({ crop, scale, ripe }: { crop: CropDef; scale: number; ripe: boolean }) {
  const { shape, leafColor, fruitColor } = crop.look;

  if (shape === "tall") {
    return (
      <group>
        <mesh position={[0, SOIL_HEIGHT + 0.3 * scale, 0]} scale={[scale, scale, scale]}>
          <coneGeometry args={[0.15, 0.6, 5]} />
          <meshStandardMaterial color={leafColor} flatShading />
        </mesh>
        {ripe && (
          <mesh position={[0, SOIL_HEIGHT + 0.02, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.1, 0.32, 6]} />
            <meshStandardMaterial color={fruitColor} flatShading />
          </mesh>
        )}
      </group>
    );
  }

  if (shape === "bush") {
    return (
      <group>
        <mesh position={[0, SOIL_HEIGHT + 0.3 * scale, 0]} scale={[scale, scale, scale]}>
          <icosahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color={leafColor} flatShading />
        </mesh>
        {ripe &&
          [
            [0.2, 0.3, 0.1],
            [-0.18, 0.36, 0.14],
            [0.02, 0.26, -0.22],
          ].map(([x, y, z], i) => (
            <mesh key={i} position={[x!, SOIL_HEIGHT + y!, z!]}>
              <sphereGeometry args={[0.09, 8, 6]} />
              <meshStandardMaterial color={fruitColor} flatShading />
            </mesh>
          ))}
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, SOIL_HEIGHT + 0.14 * scale, 0]} scale={[scale, 0.55 * scale, scale]}>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color={leafColor} flatShading />
      </mesh>
      {ripe &&
        [
          [0.22, 0.04, 0.12],
          [-0.2, 0.04, -0.1],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x!, SOIL_HEIGHT + y!, z!]}>
            <sphereGeometry args={[0.1, 8, 6]} />
            <meshStandardMaterial color={fruitColor} flatShading />
          </mesh>
        ))}
    </group>
  );
}

function PlotView({ spec }: { spec: PlotSpec }) {
  useFarmStore((s) => visualKey(s.plots[spec.id])); // berlangganan perubahan visual saja
  const plot = useFarmStore.getState().plots[spec.id];
  const crop = plot?.cropId ? getCropDef(plot.cropId) : undefined;
  const wet = plot ? isWet(plot) : false;
  const tilled = plot ? plot.status !== "empty" : false;

  const progress = plot ? getGrowthProgress(plot) : 0;
  const ripe = plot?.status === "harvestable";
  const scale = ripe ? 1 : plot?.status === "planted" ? 0.25 : 0.3 + 0.7 * progress;

  const dx = spec.w * 0.22;
  const dz = spec.d * 0.22;

  return (
    <group position={[spec.cx, 0, spec.cz]}>
      <mesh position={[0, SOIL_HEIGHT / 2, 0]}>
        <boxGeometry args={[spec.w, SOIL_HEIGHT, spec.d]} />
        <meshStandardMaterial color={wet ? "#3d2d1f" : tilled ? "#6a5038" : "#7a6a4c"} flatShading />
      </mesh>
      {crop &&
        [
          [-dx, -dz],
          [dx, -dz],
          [-dx, dz],
          [dx, dz],
        ].map(([x, z], i) => (
          <group key={i} position={[x!, 0, z!]}>
            <Plant crop={crop} scale={scale} ripe={ripe} />
          </group>
        ))}
    </group>
  );
}

export function FarmPlots() {
  return (
    <>
      {villageLayout.gardenPlots.map((spec) => (
        <PlotView key={spec.id} spec={spec} />
      ))}
    </>
  );
}
