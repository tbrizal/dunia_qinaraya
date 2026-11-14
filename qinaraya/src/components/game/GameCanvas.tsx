import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { gameConfig } from "../../config/gameConfig";
import { VillageScene } from "../../worlds/qinaraya-village/VillageScene";
import { FpsMeter } from "./FpsMeter";

export function GameCanvas() {
  return (
    <Canvas
      camera={{ fov: gameConfig.camera.fov, near: 0.1, far: 200, position: [0, 6, 20] }}
      dpr={[1, gameConfig.render.maxPixelRatio]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <VillageScene />
      </Suspense>
      <FpsMeter />
    </Canvas>
  );
}
