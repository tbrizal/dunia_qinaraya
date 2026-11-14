import { gameConfig } from "../../config/gameConfig.ts";
import { createPlayerState } from "../movement/stepPlayer.ts";

const { spawn } = gameConfig.player;

/** State pemain tunggal yang dibaca game loop, kamera, dan (nanti) sistem interaksi. */
export const playerState = createPlayerState(spawn.x, spawn.z, spawn.heading);

export function resetPlayerState(): void {
  playerState.x = spawn.x;
  playerState.z = spawn.z;
  playerState.vx = 0;
  playerState.vz = 0;
  playerState.heading = spawn.heading;
  playerState.moveAmount = 0;
  playerState.running = false;
}
