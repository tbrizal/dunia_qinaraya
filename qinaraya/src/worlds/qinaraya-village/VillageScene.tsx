import { useEffect } from "react";
import { PlayerRig } from "../../components/game/PlayerRig";
import { gameConfig } from "../../config/gameConfig";
import { useAppStore } from "../../stores/useAppStore";
import { Backdrop } from "./Backdrop";
import { Buildings } from "./Buildings";
import { Ground } from "./Ground";
import { Vegetation } from "./Vegetation";
import { villageLayout } from "./villageLayout";

/** Prototipe Qinaraya Village: desa kecil yang bisa dijelajahi dengan collision dasar. */
export function VillageScene() {
  const setSceneReady = useAppStore((s) => s.setSceneReady);

  useEffect(() => {
    setSceneReady(true);
    return () => setSceneReady(false);
  }, [setSceneReady]);

  const { backgroundColor, fogNear, fogFar } = gameConfig.scene;

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <fog attach="fog" args={[backgroundColor, fogNear, fogFar]} />

      {/* Cahaya hangat dan lembut: langit pucat, bayangan tanah kecokelatan. */}
      <hemisphereLight args={["#e6f0dc", "#6e5d45", 0.95]} />
      <directionalLight position={[-14, 20, 12]} intensity={1.15} color="#ffe6bd" />

      <Ground />
      <Buildings />
      <Vegetation />
      <Backdrop />

      <PlayerRig colliders={villageLayout.colliders} bounds={villageLayout.bounds} />
    </>
  );
}
