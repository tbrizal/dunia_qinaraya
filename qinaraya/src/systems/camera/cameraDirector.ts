/**
 * Pengarah kamera untuk adegan khusus (mis. aktivitas ibadah). Saat aktif, kamera orbit bergerak halus
 * menuju sudut yang ditentukan dan input kamera pemain diabaikan. Murni: hanya data bersama.
 */
export interface CameraDirectorState {
  active: boolean;
  yaw: number;
  pitch: number;
  distance: number;
  focusX: number;
  focusY: number;
  focusZ: number;
}

export const cameraDirector: CameraDirectorState = {
  active: false,
  yaw: 0,
  pitch: 0.3,
  distance: 4.5,
  focusX: 0,
  focusY: 0.6,
  focusZ: 0,
};

export function directCamera(shot: Omit<CameraDirectorState, "active">): void {
  Object.assign(cameraDirector, shot, { active: true });
}

export function releaseCamera(): void {
  cameraDirector.active = false;
}
