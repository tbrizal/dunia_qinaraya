import { clamp, dampFactor } from "../movement/movementMath.ts";

/** Logika kamera orbit third-person. Murni, tanpa dependensi Three.js. */

export interface CameraRigState {
  yaw: number;
  pitch: number;
  distance: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  hasTarget: boolean;
}

export interface CameraTuning {
  minDistance: number;
  maxDistance: number;
  minPitch: number;
  maxPitch: number;
  rotateSpeed: number;
  minHeight: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export function createCameraRig(yaw: number, pitch: number, distance: number): CameraRigState {
  return { yaw, pitch, distance, targetX: 0, targetY: 0, targetZ: 0, hasTarget: false };
}

/**
 * Menerapkan drag (piksel) dan zoom (satuan jarak) ke kamera.
 * Drag ke kanan memutar pandangan ke kanan; drag ke bawah menunduk.
 */
export function applyCameraInput(
  rig: CameraRigState,
  dragX: number,
  dragY: number,
  zoomDelta: number,
  sensitivity: number,
  tuning: CameraTuning,
): void {
  rig.yaw -= dragX * tuning.rotateSpeed * sensitivity;
  rig.pitch = clamp(rig.pitch + dragY * tuning.rotateSpeed * sensitivity, tuning.minPitch, tuning.maxPitch);
  rig.distance = clamp(rig.distance + zoomDelta, tuning.minDistance, tuning.maxDistance);
}

/** Titik target kamera mengikuti pemain dengan halus. Panggilan pertama langsung menempel. */
export function followTarget(rig: CameraRigState, x: number, y: number, z: number, dt: number, sharpness: number): void {
  if (!rig.hasTarget) {
    rig.targetX = x;
    rig.targetY = y;
    rig.targetZ = z;
    rig.hasTarget = true;
    return;
  }
  const k = dampFactor(sharpness, dt);
  rig.targetX += (x - rig.targetX) * k;
  rig.targetY += (y - rig.targetY) * k;
  rig.targetZ += (z - rig.targetZ) * k;
}

export function computeCameraPosition(rig: CameraRigState, minHeight: number, out: Vec3): Vec3 {
  const horizontal = Math.cos(rig.pitch) * rig.distance;
  out.x = rig.targetX + Math.sin(rig.yaw) * horizontal;
  out.y = Math.max(minHeight, rig.targetY + Math.sin(rig.pitch) * rig.distance);
  out.z = rig.targetZ + Math.cos(rig.yaw) * horizontal;
  return out;
}
