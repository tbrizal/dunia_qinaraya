/**
 * Konfigurasi game terpusat.
 * Nilai di sini adalah default prototipe dan mudah diseimbangkan ulang.
 * Satuan dunia: 1 unit = 1 meter. Sudut dalam radian.
 */
export const gameConfig = {
  title: "Dunia Qinaraya",
  tagline: "Where Life, Adventure, and Faith Grow Together.",
  scene: {
    groundSize: 220,
    backgroundColor: "#c6dcd6",
    fogNear: 35,
    fogFar: 90,
  },
  // Batas pixel ratio menjaga performa di layar mobile beresolusi tinggi.
  render: {
    maxPixelRatio: 2,
  },
  world: {
    /** Setengah lebar area bermain (area persegi dari pusat desa). */
    halfSize: 24,
  },
  player: {
    radius: 0.4,
    walkSpeed: 3.4,
    runSpeed: 6,
    /** Semakin besar semakin responsif (satuan 1/detik). */
    acceleration: 14,
    /** Kecepatan putar badan karakter (radian/detik). */
    turnSpeed: 14,
    spawn: { x: 0, z: 10, heading: Math.PI },
  },
  camera: {
    fov: 55,
    initialYaw: 0,
    initialPitch: 0.42,
    distance: 7,
    minDistance: 3.5,
    maxDistance: 12,
    minPitch: 0.1,
    maxPitch: 1.3,
    /** Tinggi titik yang dilihat kamera dari kaki karakter. */
    targetHeight: 1.3,
    followSharpness: 10,
    /** Radian per piksel drag pada sensitivitas 1. */
    rotateSpeed: 0.0055,
    wheelZoomSpeed: 0.008,
    pinchZoomSpeed: 0.03,
    minHeight: 0.6,
  },
  input: {
    joystickDeadZone: 0.12,
  },
  settings: {
    sensitivityMin: 0.4,
    sensitivityMax: 2.5,
    sensitivityDefault: 1,
  },
} as const;
