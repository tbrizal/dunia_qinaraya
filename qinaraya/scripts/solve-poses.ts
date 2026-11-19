import { writeFileSync } from "node:fs";
import { Vector3 } from "three";
import { applyPose, createWorshipRig } from "../src/components/game/worshipRig.ts";
import type { MarkerName } from "../src/components/game/worshipRig.ts";
import { CHANNELS, NEUTRAL, mirrorRightToLeft } from "../src/systems/worship/poses.ts";
import type { Channel, PoseValues } from "../src/systems/worship/poses.ts";

/**
 * Alat pengembangan: mencari sudut sendi yang memenuhi target posisi tubuh (geometri nyata dari kerangka
 * yang sama dengan yang tampil di game). Hasil ditulis ke systems/worship/poseLibrary.generated.ts.
 * Jalankan: npm run poses:solve. Mengubah target di sini berarti mengubah bentuk pose; test geometri
 * (tests/worship-poses.test.ts) tetap memverifikasi hasilnya secara independen.
 */

type Vec = [number | null, number | null, number | null];
interface Target { marker: MarkerName; pos: Vec; w?: number }
interface Link { a: MarkerName; b: MarkerName; offset?: [number, number, number]; w?: number }
interface ChannelTarget { channel: Channel; value: number; w?: number }
interface Spec {
  id: string;
  init?: Partial<PoseValues>;
  free: Channel[];
  /** Hanya channel sisi kanan yang dicari; sisi kiri disalin. Target marker ".R" dicerminkan otomatis. */
  mirror?: boolean;
  targets?: Target[];
  links?: Link[];
  channelTargets?: ChannelTarget[];
  reg?: number;
}

const palette = { tunic: "#000", pants: "#000", hair: "#000", skin: "#000", bag: "#000" };
const rig = createWorshipRig(palette, 1);
const tmp = new Vector3();
const ALL: MarkerName[] = ["handR", "handL", "elbowR", "elbowL", "kneeR", "kneeL", "ankleR", "ankleL", "toeR", "toeL", "heelR", "heelL", "forehead", "nose", "headTop", "chest", "pelvis", "back"];

function pos(name: MarkerName): [number, number, number] {
  rig.markers[name].getWorldPosition(tmp);
  return [tmp.x, tmp.y, tmp.z];
}

function expand(values: Partial<PoseValues>, mirror: boolean): PoseValues {
  return { ...NEUTRAL, ...(mirror ? mirrorRightToLeft(values) : values) };
}

function error(values: PoseValues, spec: Spec, start: PoseValues): number {
  applyPose(rig, values);
  rig.root.updateMatrixWorld(true);
  let e = 0;
  const targets: Target[] = [...(spec.targets ?? [])];
  if (spec.mirror) for (const t of spec.targets ?? []) if (t.marker.endsWith("R")) targets.push({ ...t, marker: (t.marker.slice(0, -1) + "L") as MarkerName, pos: [t.pos[0] === null ? null : -t.pos[0], t.pos[1], t.pos[2]] });
  for (const t of targets) {
    const p = pos(t.marker);
    t.pos.forEach((v, i) => {
      if (v !== null) e += (t.w ?? 1) * (p[i]! - v) ** 2;
    });
  }
  for (const l of spec.links ?? []) {
    const a = pos(l.a);
    const b = pos(l.b);
    const o = l.offset ?? [0, 0, 0];
    for (let i = 0; i < 3; i++) e += (l.w ?? 1) * (a[i]! - (b[i]! + o[i]!)) ** 2;
  }
  for (const c of spec.channelTargets ?? []) e += (c.w ?? 1) * (values[c.channel] - c.value) ** 2;
  // Tidak boleh menembus lantai.
  for (const m of ALL) {
    const y = pos(m)[1];
    if (y < -0.004) e += 80 * (y + 0.004) ** 2;
  }
  for (const c of CHANNELS) e += (spec.reg ?? 0.002) * (values[c] - start[c]) ** 2;
  return e;
}

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function solve(spec: Spec): { values: PoseValues; err: number } {
  const mirror = spec.mirror ?? false;
  const start = expand(spec.init ?? {}, mirror);
  const free = spec.free;
  const rnd = rand(1234 + spec.id.length * 17);
  let best: { values: PoseValues; err: number } | null = null;

  for (let attempt = 0; attempt < 14; attempt++) {
    let cur = { ...start };
    if (attempt > 0) for (const c of free) cur[c] = start[c] + (rnd() - 0.5) * 1.2;
    cur = expand(cur, mirror);
    let e = error(cur, spec, start);
    let step = 0.4;
    for (let iter = 0; iter < 400 && step > 1e-4; iter++) {
      let improved = false;
      for (const c of free) {
        for (const dir of [1, -1]) {
          const cand = { ...cur };
          cand[c] = cur[c] + dir * step;
          const full = expand(cand, mirror);
          const ce = error(full, spec, start);
          if (ce < e - 1e-12) {
            cur = full;
            e = ce;
            improved = true;
          }
        }
      }
      if (!improved) step *= 0.5;
    }
    if (!best || e < best.err) best = { values: cur, err: e };
  }
  return best!;
}

const ARMS: Channel[] = ["shoulderR.x", "shoulderR.z", "elbowR.x", "elbowR.y"];
const ARMS_L: Channel[] = ["shoulderL.x", "shoulderL.z", "elbowL.x", "elbowL.y"];
const LEGS: Channel[] = ["hipR", "kneeR", "ankleR"];
const LEGS_L: Channel[] = ["hipL", "kneeL", "ankleL"];
const BODY: Channel[] = ["rootY", "rootZ", "torso", "head"];

const specs: Spec[] = [
  // ----- Salat -----
  { id: "qiyam", init: { head: 0.22, "shoulderR.x": -0.35, "shoulderR.z": 0.3, "elbowR.x": -1.5, "elbowR.y": 0.9 }, free: ARMS, mirror: true, targets: [{ marker: "handR", pos: [-0.05, 0.9, 0.2] }], channelTargets: [{ channel: "head", value: 0.22, w: 5 }] },
  { id: "takbir-up", init: { head: 0.1, "shoulderR.x": -1.4, "elbowR.x": -1.6 }, free: ARMS, mirror: true, targets: [{ marker: "handR", pos: [-0.3, 1.2, 0.12] }], channelTargets: [{ channel: "head", value: 0.1, w: 5 }] },
  {
    id: "rukuk",
    init: { torso: 1.5, head: -0.6, "shoulderR.x": 0.2, rootZ: -0.08 },
    free: [...BODY, ...ARMS, ...LEGS],
    mirror: true,
    links: [{ a: "handR", b: "kneeR", offset: [0, 0.02, 0.02], w: 6 }],
    channelTargets: [{ channel: "torso", value: 1.5708, w: 25 }, { channel: "head", value: -0.55, w: 3 }],
    targets: [{ marker: "forehead", pos: [null, null, null], w: 0 }],
  },
  {
    id: "kneel-hands",
    init: { rootY: -0.2, rootZ: 0.1, torso: 0.9, hipR: -0.3, kneeR: 1.6, ankleR: 1.5, "shoulderR.x": -0.9, head: 0.2 },
    free: [...BODY, ...ARMS, ...LEGS],
    mirror: true,
    links: [
      { a: "toeR", b: "ankleR", offset: [0, -0.03, -0.15], w: 4 },
    ],
    targets: [
      { marker: "kneeR", pos: [null, 0.09, null], w: 8 },
      { marker: "ankleR", pos: [null, 0.03, null], w: 8 },
      { marker: "handR", pos: [-0.26, 0.06, 0.52], w: 3 },
    ],
  },
  {
    id: "sujud",
    init: { rootY: -0.16, rootZ: -0.05, torso: 1.9, hipR: -0.35, kneeR: 1.62, ankleR: 1.5, "shoulderR.x": -0.6, head: 0.1 },
    free: [...BODY, ...ARMS, ...LEGS],
    mirror: true,
    links: [
      { a: "toeR", b: "ankleR", offset: [0, -0.03, -0.15], w: 4 },
    ],
    targets: [
      { marker: "kneeR", pos: [null, 0.09, null], w: 10 },
      { marker: "ankleR", pos: [null, 0.03, null], w: 10 },
      { marker: "forehead", pos: [0, 0.03, 0.55], w: 6 },
      { marker: "nose", pos: [0, null, null], w: 1 },
      { marker: "handR", pos: [-0.24, 0.07, 0.52], w: 4 },
    ],
    channelTargets: [{ channel: "head", value: 0.0, w: 0.05 }],
  },
  {
    // Duduk di antara dua sujud (iftirasy): duduk di atas telapak kaki kiri, kaki kanan ditegakkan.
    id: "duduk",
    init: { rootY: -0.3, rootZ: -0.05, torso: 0.0, head: 0.15, hipL: -1.0, kneeL: 2.6, hipR: -1.2, kneeR: 1.9, ankleR: 0.8, "shoulderR.x": -0.5, "elbowR.x": -0.9, "shoulderL.x": -0.5, "elbowL.x": -0.9 },
    free: [...BODY, ...LEGS, ...LEGS_L, ...ARMS, ...ARMS_L],
    targets: [
      { marker: "kneeL", pos: [null, 0.09, 0.26], w: 6 },
      { marker: "ankleL", pos: [null, 0.03, null], w: 8 },
      { marker: "kneeR", pos: [null, 0.3, 0.3], w: 4 },
      { marker: "toeR", pos: [null, 0.01, 0.2], w: 6 },
      { marker: "pelvis", pos: [null, null, null], w: 0 },
    ],
    links: [
      { a: "pelvis", b: "ankleL", offset: [0, 0.14, 0.05], w: 5 },
      { a: "toeL", b: "ankleL", offset: [0, -0.03, -0.15], w: 5 },
      { a: "handR", b: "kneeR", offset: [0, 0.07, -0.06], w: 4 },
      { a: "handL", b: "kneeL", offset: [0, 0.08, -0.08], w: 4 },
    ],
    channelTargets: [{ channel: "torso", value: 0.05, w: 8 }, { channel: "head", value: 0.15, w: 4 }],
  },
  {
    // Duduk tasyahud akhir (tawarruk): duduk di lantai, kaki kiri di bawah kaki kanan.
    id: "tasyahud-akhir",
    init: { rootY: -0.38, rootZ: -0.12, torso: 0.0, head: 0.12, hipR: -1.9, kneeR: 2.7, ankleR: 0.1, hipL: -1.5, kneeL: 2.6, "shoulderR.x": -0.2, "elbowR.x": -1.2, "shoulderL.x": -0.2, "elbowL.x": -1.2 },
    free: [...BODY, ...LEGS, ...LEGS_L, ...ARMS, ...ARMS_L],
    targets: [
      { marker: "pelvis", pos: [null, 0.11, -0.12], w: 8 },
      { marker: "kneeR", pos: [null, 0.3, 0.3], w: 4 },
      { marker: "toeR", pos: [null, 0.01, 0.2], w: 6 },
      { marker: "ankleR", pos: [null, 0.15, 0.13], w: 3 },
      { marker: "kneeL", pos: [null, 0.11, 0.32], w: 5 },
      { marker: "ankleL", pos: [null, 0.03, 0.1], w: 6 },
    ],
    links: [
      { a: "toeL", b: "ankleL", offset: [0, -0.03, -0.15], w: 5 },
      { a: "handR", b: "kneeR", offset: [0, 0.06, -0.08], w: 4 },
      { a: "handL", b: "kneeL", offset: [0, 0.08, -0.08], w: 4 },
    ],
    channelTargets: [{ channel: "torso", value: 0.05, w: 8 }, { channel: "head", value: 0.12, w: 4 }],
  },
  // ----- Wudu -----
  { id: "wudu-ready", init: { "shoulderR.x": -0.55, "elbowR.x": -1.0, "shoulderR.z": 0.15 }, free: ARMS, mirror: true, targets: [{ marker: "handR", pos: [-0.14, 0.92, 0.26] }] },
  { id: "wudu-hands-a", init: { "shoulderR.x": -0.55, "elbowR.x": -1.0, "shoulderR.z": 0.3, "elbowR.y": 0.4, head: 0.18 }, free: ARMS, mirror: true, targets: [{ marker: "handR", pos: [-0.05, 0.93, 0.26] }], channelTargets: [{ channel: "head", value: 0.18, w: 4 }] },
  { id: "wudu-hands-b", init: { "shoulderR.x": -0.55, "elbowR.x": -1.0, "shoulderR.z": 0.3, "elbowR.y": 0.4, head: 0.18 }, free: ARMS, mirror: true, targets: [{ marker: "handR", pos: [-0.05, 0.97, 0.36] }], channelTargets: [{ channel: "head", value: 0.18, w: 4 }] },
  { id: "wudu-mouth", init: { "shoulderR.x": -0.9, "elbowR.x": -2.0, "shoulderR.z": 0.1, head: 0.12 }, free: ARMS, targets: [{ marker: "handR", pos: [-0.03, 1.33, 0.33] }], channelTargets: [{ channel: "head", value: 0.12, w: 4 }] },
  { id: "wudu-nose", init: { "shoulderR.x": -1.0, "elbowR.x": -2.1, "shoulderR.z": 0.1, head: 0.18 }, free: ARMS, targets: [{ marker: "handR", pos: [-0.03, 1.42, 0.34] }], channelTargets: [{ channel: "head", value: 0.18, w: 4 }] },
  { id: "wudu-face-up", init: { "shoulderR.x": -1.1, "elbowR.x": -2.2, "shoulderR.z": 0.3, head: 0.05 }, free: ARMS, mirror: true, targets: [{ marker: "handR", pos: [-0.1, 1.52, 0.33] }], channelTargets: [{ channel: "head", value: 0.05, w: 4 }] },
  { id: "wudu-face-down", init: { "shoulderR.x": -0.9, "elbowR.x": -2.0, "shoulderR.z": 0.3, head: 0.05 }, free: ARMS, mirror: true, targets: [{ marker: "handR", pos: [-0.1, 1.28, 0.33] }], channelTargets: [{ channel: "head", value: 0.05, w: 4 }] },
  {
    id: "wudu-arm-a",
    init: { "shoulderR.x": -1.3, "elbowR.x": -0.1, "shoulderL.x": -0.8, "elbowL.x": -1.2, "shoulderL.z": 0.4, head: 0.15 },
    free: [...ARMS, ...ARMS_L],
    targets: [{ marker: "handR", pos: [-0.26, 1.02, 0.5], w: 3 }, { marker: "handL", pos: [-0.24, 1.04, 0.46], w: 3 }],
    channelTargets: [{ channel: "head", value: 0.15, w: 4 }],
  },
  {
    id: "wudu-arm-b",
    init: { "shoulderR.x": -1.3, "elbowR.x": -0.1, "shoulderL.x": -0.8, "elbowL.x": -1.6, "shoulderL.z": 0.4, head: 0.15 },
    free: [...ARMS, ...ARMS_L],
    targets: [{ marker: "handR", pos: [-0.26, 1.02, 0.5], w: 3 }, { marker: "handL", pos: [-0.26, 1.06, 0.28], w: 3 }],
    channelTargets: [{ channel: "head", value: 0.15, w: 4 }],
  },
  { id: "wudu-head-a", init: { "shoulderR.x": -2.0, "elbowR.x": -1.8, head: 0.1 }, free: ARMS, targets: [{ marker: "handR", pos: [-0.14, 1.62, 0.2] }], channelTargets: [{ channel: "head", value: 0.1, w: 4 }] },
  { id: "wudu-head-b", init: { "shoulderR.x": -2.0, "elbowR.x": -1.8, head: 0.1 }, free: ARMS, targets: [{ marker: "handR", pos: [-0.14, 1.64, -0.04] }], channelTargets: [{ channel: "head", value: 0.1, w: 4 }] },
  { id: "wudu-ears", init: { "shoulderR.x": -1.0, "shoulderR.z": -0.5, "elbowR.x": -2.0, head: 0.05 }, free: ARMS, mirror: true, targets: [{ marker: "handR", pos: [-0.31, 1.48, 0.0] }], channelTargets: [{ channel: "head", value: 0.05, w: 4 }] },
  {
    id: "wudu-foot",
    init: { torso: 0.65, rootZ: -0.1, hipR: -1.0, kneeR: 1.1, "shoulderR.x": -1.0, "elbowR.x": -0.7, "shoulderL.x": -0.4, "elbowL.x": -0.3, head: 0.2 },
    free: ["rootZ", "torso", ...LEGS, ...ARMS, ...ARMS_L],
    targets: [{ marker: "ankleR", pos: [-0.13, 0.55, 0.42], w: 3 }],
    links: [
      { a: "handR", b: "ankleR", offset: [0, 0.06, 0.03], w: 6 },
      { a: "handL", b: "kneeL", offset: [0, 0.03, 0], w: 3 },
    ],
    channelTargets: [{ channel: "head", value: 0.2, w: 4 }],
  },
  { id: "wudu-dua", init: { "shoulderR.x": -0.7, "elbowR.x": -1.4, "shoulderR.z": 0.2, head: -0.12 }, free: ARMS, mirror: true, targets: [{ marker: "handR", pos: [-0.11, 1.06, 0.3] }], channelTargets: [{ channel: "head", value: -0.12, w: 4 }] },
];

const result: Record<string, Partial<PoseValues>> = {};
const report: string[] = [];
for (const spec of specs) {
  const { values, err } = solve(spec);
  const rounded: Partial<PoseValues> = {};
  for (const c of CHANNELS) {
    const v = Math.round(values[c] * 1000) / 1000;
    if (Math.abs(v) > 1e-6) rounded[c] = v;
  }
  result[spec.id] = rounded;
  report.push(`${spec.id.padEnd(16)} err=${err.toFixed(5)}`);
}
console.log(report.join("\n"));

writeFileSync(
  new URL("../src/systems/worship/poseLibrary.generated.ts", import.meta.url),
  `import type { PoseValues } from "./poses.ts";

/**
 * DIHASILKAN OTOMATIS oleh scripts/solve-poses.ts dari target geometri tubuh. Jangan diedit manual:
 * ubah target di skrip lalu jalankan \`npm run poses:solve\`. Test geometri memverifikasi hasilnya.
 */
export const SOLVED_POSES: Record<string, Partial<PoseValues>> = ${JSON.stringify(result, null, 2)};
`,
);
