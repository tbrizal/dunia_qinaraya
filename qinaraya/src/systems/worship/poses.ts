/**
 * Pose dan klip animasi wudu dan salat. Murni: hanya angka, tanpa Three.js.
 * Konvensi sudut (radian, rotasi sumbu X pada sendi): sudut positif menekuk batang tubuh/kepala ke depan,
 * mengayunkan anggota yang menggantung ke belakang, dan menekuk lutut. Lengan diangkat ke depan dengan sudut
 * negatif, siku menekuk dengan sudut negatif. Channel ".z" pada bahu = merapat ke tengah tubuh, ".y" pada siku
 * = menoleh ke tengah (keduanya dicerminkan otomatis untuk sisi kiri).
 */

export const CHANNELS = [
  "rootY",
  "rootZ",
  "torso",
  "head",
  "headTurn",
  "shoulderR.x",
  "shoulderR.z",
  "elbowR.x",
  "elbowR.y",
  "shoulderL.x",
  "shoulderL.z",
  "elbowL.x",
  "elbowL.y",
  "hipR",
  "kneeR",
  "ankleR",
  "hipL",
  "kneeL",
  "ankleL",
] as const;

export type Channel = (typeof CHANNELS)[number];
export type PoseValues = Record<Channel, number>;

export const NEUTRAL: PoseValues = Object.fromEntries(CHANNELS.map((c) => [c, 0])) as PoseValues;

/** Menyalin nilai sisi kanan ke sisi kiri (tubuh simetris). */
export function mirrorRightToLeft(values: Partial<PoseValues>): Partial<PoseValues> {
  const out: Partial<PoseValues> = { ...values };
  const pairs: [Channel, Channel][] = [
    ["shoulderR.x", "shoulderL.x"],
    ["shoulderR.z", "shoulderL.z"],
    ["elbowR.x", "elbowL.x"],
    ["elbowR.y", "elbowL.y"],
    ["hipR", "hipL"],
    ["kneeR", "kneeL"],
    ["ankleR", "ankleL"],
  ];
  for (const [r, l] of pairs) if (values[r] !== undefined) out[l] = values[r];
  return out;
}

/** Menukar sisi kanan dan kiri (untuk gerakan yang dilakukan bergantian). */
export function swapSides(values: Partial<PoseValues>): Partial<PoseValues> {
  const out: Partial<PoseValues> = { ...values };
  const pairs: [Channel, Channel][] = [
    ["shoulderR.x", "shoulderL.x"],
    ["shoulderR.z", "shoulderL.z"],
    ["elbowR.x", "elbowL.x"],
    ["elbowR.y", "elbowL.y"],
    ["hipR", "hipL"],
    ["kneeR", "kneeL"],
    ["ankleR", "ankleL"],
  ];
  for (const [r, l] of pairs) {
    out[r] = values[l] ?? 0;
    out[l] = values[r] ?? 0;
  }
  return out;
}

export function blendPoses(a: PoseValues, b: PoseValues, t: number): PoseValues {
  const out = { ...a };
  for (const c of CHANNELS) out[c] = a[c] + (b[c] - a[c]) * t;
  return out;
}

export const smoothstep = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

// POSES diisi di poseLibrary.ts (nilai hasil penyelesaian geometri; lihat scripts/solve-poses.ts).
