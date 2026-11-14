import { resolveCollisions } from "./collision.ts";
import type { Collider, WorldBounds } from "./collision.ts";
import { approachAngle, cameraRelativeDirection, dampFactor } from "./movementMath.ts";
import type { Vec2 } from "./movementMath.ts";

export interface PlayerState {
  x: number;
  z: number;
  vx: number;
  vz: number;
  /** Arah hadap karakter di sumbu Y. Model menghadap +Z pada heading 0. */
  heading: number;
  /** 0 = diam, 1 = kecepatan lari penuh. Dipakai untuk animasi. */
  moveAmount: number;
  running: boolean;
}

export interface MoveInput {
  /** Kanan positif, rentang -1..1. */
  moveX: number;
  /** Maju positif, rentang -1..1. */
  moveY: number;
  sprint: boolean;
}

export interface PlayerTuning {
  radius: number;
  walkSpeed: number;
  runSpeed: number;
  acceleration: number;
  turnSpeed: number;
}

const MAX_STEP = 0.05;
const INTENT_THRESHOLD = 0.05;

// Buffer yang dipakai ulang agar tidak membuat objek baru tiap frame.
const direction: Vec2 = { x: 0, z: 0 };
const nextPos: Vec2 = { x: 0, z: 0 };

export function createPlayerState(x: number, z: number, heading: number): PlayerState {
  return { x, z, vx: 0, vz: 0, heading, moveAmount: 0, running: false };
}

/**
 * Memajukan simulasi pemain satu langkah. Mengubah `state` secara langsung.
 * Gerakan relatif terhadap yaw kamera; collision menghasilkan efek meluncur di dinding.
 */
export function stepPlayer(
  state: PlayerState,
  input: MoveInput,
  cameraYaw: number,
  dt: number,
  tuning: PlayerTuning,
  colliders: readonly Collider[],
  bounds: WorldBounds,
): void {
  if (!(dt > 0)) return;
  const step = Math.min(dt, MAX_STEP);

  cameraRelativeDirection(input.moveX, input.moveY, cameraYaw, direction);
  const intent = Math.hypot(direction.x, direction.z);
  if (intent > 1) {
    direction.x /= intent;
    direction.z /= intent;
  }
  const hasIntent = intent > INTENT_THRESHOLD;
  const running = input.sprint && hasIntent;
  const maxSpeed = running ? tuning.runSpeed : tuning.walkSpeed;

  const k = dampFactor(tuning.acceleration, step);
  state.vx += (direction.x * maxSpeed - state.vx) * k;
  state.vz += (direction.z * maxSpeed - state.vz) * k;

  nextPos.x = state.x + state.vx * step;
  nextPos.z = state.z + state.vz * step;
  resolveCollisions(nextPos, tuning.radius, colliders, bounds);

  // Kecepatan akhir dihitung dari perpindahan nyata, sehingga menabrak dinding
  // tidak menumpuk kecepatan dan animasi kaki berhenti saat tertahan.
  state.vx = (nextPos.x - state.x) / step;
  state.vz = (nextPos.z - state.z) / step;
  state.x = nextPos.x;
  state.z = nextPos.z;

  state.moveAmount = Math.min(1, Math.hypot(state.vx, state.vz) / tuning.runSpeed);
  state.running = running;

  if (hasIntent) {
    state.heading = approachAngle(state.heading, Math.atan2(direction.x, direction.z), tuning.turnSpeed * step);
  }
}
