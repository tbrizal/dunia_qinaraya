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
  clock: {
    /** 60 detik nyata = 1 jam game, jadi 1 hari game = 24 menit nyata. */
    realSecondsPerGameHour: 60,
    /** Kalender simulasi generik. Kalender Hijriah dipetakan di atasnya pada Phase 3. */
    daysPerMonth: 30,
    monthsPerYear: 12,
    start: { day: 1, month: 1, year: 1, hour: 6, minute: 30 },
    /** Pilihan kecepatan untuk pengujian. */
    speedOptions: [1, 4, 16],
    /** Batas delta per frame agar waktu tidak melompat setelah tab kembali aktif. */
    maxTickSeconds: 0.25,
  },
  inventory: {
    slots: 20,
  },
  farming: {
    /** Satu kali siram membasahi tanah selama sekian menit game. */
    waterDurationMinutes: 480,
  },
  interaction: {
    /** Jarak maksimum (meter) dari tepi petak kebun. */
    plotRange: 0.9,
    /** Jarak maksimum (meter) dari pusat NPC. */
    npcRange: 2.2,
  },
  save: {
    key: "qinaraya.save",
    autosaveSeconds: 20,
    debounceMs: 1500,
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
