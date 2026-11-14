/** Fungsi matematika murni untuk pergerakan. Tanpa dependensi DOM atau Three.js. */

export interface Vec2 {
  x: number;
  z: number;
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * Mengubah input (moveX = kanan, moveY = maju) menjadi arah dunia relatif kamera.
 * Kamera berada di (+sin(yaw), +cos(yaw)) dari target, sehingga arah "maju"
 * adalah (-sin(yaw), -cos(yaw)).
 */
export function cameraRelativeDirection(moveX: number, moveY: number, yaw: number, out: Vec2): Vec2 {
  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);
  out.x = cos * moveX - sin * moveY;
  out.z = -sin * moveX - cos * moveY;
  return out;
}

/** Membungkus sudut ke rentang [-PI, PI]. */
export function wrapAngle(angle: number): number {
  const twoPi = Math.PI * 2;
  let a = (angle + Math.PI) % twoPi;
  if (a < 0) a += twoPi;
  return a - Math.PI;
}

/** Memutar `current` menuju `target` lewat jalur terpendek, maksimal `maxStep`. */
export function approachAngle(current: number, target: number, maxStep: number): number {
  const delta = wrapAngle(target - current);
  if (Math.abs(delta) <= maxStep) return wrapAngle(target);
  return wrapAngle(current + Math.sign(delta) * maxStep);
}

/** Faktor interpolasi yang stabil terhadap frame rate. */
export function dampFactor(sharpness: number, dt: number): number {
  return 1 - Math.exp(-sharpness * dt);
}
