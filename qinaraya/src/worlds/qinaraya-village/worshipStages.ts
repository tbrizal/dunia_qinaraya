import type { StageDef } from "../../systems/worship/performance";

/**
 * Tempat aktivitas ibadah di desa. Qibla di dunia Qinaraya adalah arah utara (-Z): pintu masjid menghadap
 * selatan, sehingga dinding arah salat berada di utara. Ini pengaturan dunia fiktif, bukan arah geografis nyata.
 */
export const QIBLA_HEADING = Math.PI;

/**
 * focusY sengaja negatif: panel panduan menutupi bagian bawah layar, jadi kamera diarahkan ke titik di bawah
 * karakter agar karakter tampil di bagian atas layar. Sesuaikan bersama distance dan pitch bila perlu.
 */
export const WORSHIP_STAGES: Record<"wudu" | "salat", StageDef> = {
  // Berdiri di sisi selatan bak wudu (bak berada di utara pemain), menghadap bak.
  wudu: { id: "wudu", x: -7.5, z: -10.4, heading: Math.PI, camera: { yaw: 1.15, pitch: 0.3, distance: 4.6, focusY: -1.0 } },
  // Di tikar depan pintu masjid, menghadap qibla. Kamera dari sisi timur agar rukuk dan sujud terlihat dari samping.
  salat: { id: "salat", x: 0, z: -9.8, heading: QIBLA_HEADING, camera: { yaw: Math.PI / 2 + 0.2, pitch: 0.28, distance: 5.0, focusY: -1.1 } },
};
