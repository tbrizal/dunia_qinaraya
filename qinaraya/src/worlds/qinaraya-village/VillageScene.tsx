import { useEffect } from "react";
import { GameLoop } from "../../components/game/GameLoop";
import { PlayerRig } from "../../components/game/PlayerRig";
import { useAppStore } from "../../stores/useAppStore";
import { Backdrop } from "./Backdrop";
import { Buildings } from "./Buildings";
import { DayNightLighting } from "./DayNightLighting";
import { FarmPlots } from "./FarmPlots";
import { Ground } from "./Ground";
import { Npcs } from "./Npcs";
import { TargetMarker } from "./TargetMarker";
import { Vegetation } from "./Vegetation";
import { villageLayout } from "./villageLayout";

/** Qinaraya Village: desa yang bisa dijelajahi, dengan kebun, NPC, dan siklus siang-malam. */
export function VillageScene() {
  const setSceneReady = useAppStore((s) => s.setSceneReady);

  useEffect(() => {
    setSceneReady(true);
    return () => setSceneReady(false);
  }, [setSceneReady]);

  return (
    <>
      <DayNightLighting />

      <Ground />
      <Buildings />
      <FarmPlots />
      <Vegetation />
      <Backdrop />
      <Npcs />
      <TargetMarker />

      <PlayerRig colliders={villageLayout.colliders} bounds={villageLayout.bounds} />
      <GameLoop />
    </>
  );
}
