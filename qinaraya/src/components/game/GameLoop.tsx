import { useFrame } from "@react-three/fiber";
import { gameConfig } from "../../config/gameConfig";
import { useInteractionStore } from "../../stores/useInteractionStore";
import { isModalOpen } from "../../stores/useUiStore";
import { findNearestInteractable } from "../../systems/interaction/interactables";
import { playerState } from "../../systems/player/playerState";
import { gameClock } from "../../systems/time/gameClockInstance";
import { villageInteractables } from "../../worlds/qinaraya-village/interactables";

/**
 * Detak pusat simulasi: satu-satunya pemanggil gameClock.tick() dan pemilih target interaksi.
 * Waktu dijeda saat panel terbuka atau tab disembunyikan.
 */
export function GameLoop() {
  useFrame((_, delta) => {
    const modal = isModalOpen();
    gameClock.setPaused(modal || document.hidden);
    gameClock.tick(Math.min(delta, gameConfig.clock.maxTickSeconds));

    // Target dikunci selama panel terbuka agar dialog tidak berganti sendiri.
    if (modal) return;
    const nearest = findNearestInteractable(playerState.x, playerState.z, villageInteractables, gameConfig.interaction);
    useInteractionStore.getState().setTarget(nearest ? { kind: nearest.kind, id: nearest.id } : null);
  });
  return null;
}
