import { directCamera, releaseCamera } from "../camera/cameraDirector.ts";
import { playerState } from "../player/playerState.ts";

/**
 * Keadaan pertunjukan 3D aktivitas ibadah. Objek bersama yang dibaca setiap frame oleh pelaku
 * (WorshipPerformer) dan PlayerRig. Fasenya: idle, active (aktivitas berjalan), returning (kembali berdiri).
 */

export interface StageDef {
  id: string;
  x: number;
  z: number;
  /** Arah hadap (radian) saat melakukan aktivitas. 0 menghadap +Z; PI menghadap -Z (utara). */
  heading: number;
  camera: { yaw: number; pitch: number; distance: number; focusY: number };
}

export interface WorshipPerformanceState {
  phase: "idle" | "active" | "returning";
  stage: StageDef | null;
  clip: string;
  /** Bertambah setiap klip baru atau ulang diminta. */
  clipToken: number;
}

export const worshipPerformance: WorshipPerformanceState = { phase: "idle", stage: null, clip: "stand", clipToken: 0 };

export function beginPerformance(stage: StageDef): void {
  worshipPerformance.phase = "active";
  worshipPerformance.stage = stage;
  worshipPerformance.clip = "return-stand";
  worshipPerformance.clipToken++;
  directCamera({
    yaw: stage.camera.yaw,
    pitch: stage.camera.pitch,
    distance: stage.camera.distance,
    focusX: stage.x,
    focusY: stage.camera.focusY,
    focusZ: stage.z,
  });
}

export function playClip(clip: string): void {
  worshipPerformance.clip = clip;
  worshipPerformance.clipToken++;
}

/** Mulai kembali berdiri; fase kembali ke idle dikerjakan pelaku setelah selesai. */
export function endPerformance(): void {
  if (worshipPerformance.phase === "idle") return;
  worshipPerformance.phase = "returning";
  playClip("return-stand");
}

/** Dipanggil pelaku setelah selesai kembali berdiri: pemain muncul di tempat pertunjukan. */
export function finishPerformance(): void {
  const stage = worshipPerformance.stage;
  if (stage) {
    playerState.x = stage.x;
    playerState.z = stage.z;
    playerState.vx = 0;
    playerState.vz = 0;
    playerState.heading = stage.heading;
  }
  worshipPerformance.phase = "idle";
  worshipPerformance.stage = null;
  releaseCamera();
}
