/**
 * State input bersama. Objek biasa (bukan state React) karena dibaca setiap frame.
 * Pendengar DOM (keyboard, joystick, drag) hanya menulis ke sini; game loop yang membaca.
 */

export const keyboardInput = {
  forward: false,
  back: false,
  left: false,
  right: false,
  sprint: false,
};

/** Nilai analog joystick virtual. x: kanan positif, y: maju positif, rentang -1..1. */
export const joystickInput = { x: 0, y: 0 };

export const touchButtons = { sprint: false };

/** Akumulasi drag kamera (piksel) dan zoom (satuan jarak) sejak frame terakhir. */
export const cameraInput = { dx: 0, dy: 0, zoom: 0 };

export interface MoveVector {
  x: number;
  y: number;
}

/** Joystick didahulukan bila sedang disentuh; selain itu memakai keyboard. */
export function readMoveVector(out: MoveVector): MoveVector {
  const jMag = Math.hypot(joystickInput.x, joystickInput.y);
  if (jMag > 0.001) {
    const scale = jMag > 1 ? 1 / jMag : 1;
    out.x = joystickInput.x * scale;
    out.y = joystickInput.y * scale;
    return out;
  }

  let x = (keyboardInput.right ? 1 : 0) - (keyboardInput.left ? 1 : 0);
  let y = (keyboardInput.forward ? 1 : 0) - (keyboardInput.back ? 1 : 0);
  const len = Math.hypot(x, y);
  if (len > 1) {
    x /= len;
    y /= len;
  }
  out.x = x;
  out.y = y;
  return out;
}

export function isSprintHeld(): boolean {
  return keyboardInput.sprint || touchButtons.sprint;
}

/** Mengambil akumulasi input kamera lalu mengosongkannya. */
export function consumeCameraInput(out: { dx: number; dy: number; zoom: number }): void {
  out.dx = cameraInput.dx;
  out.dy = cameraInput.dy;
  out.zoom = cameraInput.zoom;
  cameraInput.dx = 0;
  cameraInput.dy = 0;
  cameraInput.zoom = 0;
}

/** Mengosongkan semua input agar tidak ada tombol "tersangkut". */
export function resetInput(): void {
  keyboardInput.forward = false;
  keyboardInput.back = false;
  keyboardInput.left = false;
  keyboardInput.right = false;
  keyboardInput.sprint = false;
  joystickInput.x = 0;
  joystickInput.y = 0;
  touchButtons.sprint = false;
  cameraInput.dx = 0;
  cameraInput.dy = 0;
  cameraInput.zoom = 0;
}
