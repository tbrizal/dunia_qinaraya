import { SOLVED_POSES } from "./poseLibrary.generated.ts";
import { CHANNELS, NEUTRAL, blendPoses, smoothstep, swapSides } from "./poses.ts";
import type { PoseValues } from "./poses.ts";

/**
 * Pustaka pose dan klip animasi wudu dan salat. Pose hasil penyelesaian geometri (poseLibrary.generated.ts)
 * dilengkapi pose turunan (sisi kiri hasil cermin, menoleh untuk salam). Gerakan sengaja tenang dan
 * tidak terburu-buru: tidak ada gerakan cepat, melompat, atau berlebihan.
 */

const solved = (id: string): PoseValues => {
  const p = SOLVED_POSES[id];
  if (!p) throw new Error(`Pose belum diselesaikan: ${id} (jalankan npm run poses:solve)`);
  return { ...NEUTRAL, ...p };
};
const mirrored = (p: PoseValues): PoseValues => ({ ...NEUTRAL, ...swapSides(p) });

const qiyam = solved("qiyam");
const tasyahudAkhir = solved("tasyahud-akhir");
const duduk = solved("duduk");
const wuduFoot = solved("wudu-foot");
const wuduArmA = solved("wudu-arm-a");
const wuduArmB = solved("wudu-arm-b");
const wuduReady = solved("wudu-ready");

/** Lengan kiri tetap pada posisi siap (di depan perut) agar tidak naik-turun pada gerakan lengan kanan. */
const keepLeftArmReady = (p: PoseValues): PoseValues => ({
  ...p,
  "shoulderL.x": wuduReady["shoulderL.x"],
  "shoulderL.z": wuduReady["shoulderL.z"],
  "elbowL.x": wuduReady["elbowL.x"],
  "elbowL.y": wuduReady["elbowL.y"],
});

export const POSES: Record<string, PoseValues> = {
  stand: { ...NEUTRAL },
  "stand-niat": { ...NEUTRAL, head: 0.12 },
  iktidal: { ...NEUTRAL, head: 0.1 },
  qiyam,
  "takbir-up": solved("takbir-up"),
  rukuk: solved("rukuk"),
  "kneel-hands": solved("kneel-hands"),
  sujud: solved("sujud"),
  duduk,
  "tasyahud-akhir": tasyahudAkhir,
  "salam-r": { ...tasyahudAkhir, headTurn: -1.0 },
  "salam-l": { ...tasyahudAkhir, headTurn: 1.0 },

  "wudu-ready": wuduReady,
  "wudu-hands-a": solved("wudu-hands-a"),
  "wudu-hands-b": solved("wudu-hands-b"),
  "wudu-mouth": keepLeftArmReady(solved("wudu-mouth")),
  "wudu-nose": keepLeftArmReady(solved("wudu-nose")),
  "wudu-face-up": solved("wudu-face-up"),
  "wudu-face-down": solved("wudu-face-down"),
  "wudu-arm-a": wuduArmA,
  "wudu-arm-b": wuduArmB,
  "wudu-arm-la": mirrored(wuduArmA),
  "wudu-arm-lb": mirrored(wuduArmB),
  "wudu-head-a": keepLeftArmReady(solved("wudu-head-a")),
  "wudu-head-b": keepLeftArmReady(solved("wudu-head-b")),
  "wudu-ears": solved("wudu-ears"),
  "wudu-foot": wuduFoot,
  "wudu-foot-l": mirrored(wuduFoot),
  "wudu-dua": solved("wudu-dua"),
};

export interface ClipKey {
  pose: string;
  /** Lama berpindah ke pose ini (detik). */
  seconds: number;
  /** Lama menahan pose ini setelah tiba (detik). */
  hold?: number;
}

export interface Clip {
  keys: ClipKey[];
  /** Mengulang kunci mulai indeks `from` sebanyak `times` kali (mis. membasuh tiga kali). */
  loop?: { from: number; times: number };
}

const k = (pose: string, seconds: number, hold = 0): ClipKey => ({ pose, seconds, hold });

export const CLIPS: Record<string, Clip> = {
  // ----- Wudu -----
  "wudu-niat": { keys: [k("wudu-ready", 1.8, 0.8)] },
  "wudu-basmalah": { keys: [k("wudu-ready", 1.2, 0.8)] },
  "wudu-hands": { keys: [k("wudu-hands-a", 1.2), k("wudu-hands-b", 0.8), k("wudu-hands-a", 0.8)], loop: { from: 1, times: 3 } },
  "wudu-mouth": { keys: [k("wudu-ready", 1.2), k("wudu-mouth", 1.2, 0.5), k("wudu-ready", 1.0)], loop: { from: 1, times: 3 } },
  "wudu-nose": { keys: [k("wudu-ready", 1.2), k("wudu-nose", 1.2, 0.5), k("wudu-ready", 1.0)], loop: { from: 1, times: 3 } },
  "wudu-face": { keys: [k("wudu-face-up", 1.2), k("wudu-face-down", 1.0), k("wudu-face-up", 1.0)], loop: { from: 1, times: 3 } },
  "wudu-arms": {
    keys: [k("wudu-arm-a", 1.2), k("wudu-arm-b", 1.0), k("wudu-arm-a", 0.9), k("wudu-arm-b", 1.0), k("wudu-arm-a", 0.9), k("wudu-arm-b", 1.0), k("wudu-ready", 1.0), k("wudu-arm-la", 1.2), k("wudu-arm-lb", 1.0), k("wudu-arm-la", 0.9), k("wudu-arm-lb", 1.0), k("wudu-arm-la", 0.9), k("wudu-arm-lb", 1.0), k("wudu-ready", 1.0)],
  },
  "wudu-head": { keys: [k("wudu-head-a", 1.6), k("wudu-head-b", 1.2), k("wudu-head-a", 1.1), k("wudu-head-b", 1.2), k("wudu-ready", 1.6)] },
  "wudu-ears": { keys: [k("wudu-ready", 1.0), k("wudu-ears", 1.6, 1.2), k("wudu-ready", 1.4)] },
  "wudu-feet": { keys: [k("wudu-foot", 1.6, 1.6), k("wudu-ready", 1.2), k("wudu-foot-l", 1.6, 1.6), k("wudu-ready", 1.2)] },
  "wudu-dua": { keys: [k("wudu-ready", 1.0), k("wudu-dua", 1.6, 2.0)] },

  // ----- Salat -----
  "salat-niat": { keys: [k("stand-niat", 1.4, 1.0)] },
  "salat-takbir": { keys: [k("takbir-up", 1.4, 0.8), k("qiyam", 1.3, 0.6)] },
  "salat-sedekap": { keys: [k("qiyam", 1.0, 0.5)] },
  "salat-rukuk": { keys: [k("rukuk", 1.8, 1.8)] },
  "salat-iktidal": { keys: [k("iktidal", 1.8, 1.2)] },
  "salat-sujud": { keys: [k("kneel-hands", 1.6), k("sujud", 1.4, 2.0)] },
  "salat-sujud-kedua": { keys: [k("sujud", 1.6, 2.0)] },
  "salat-duduk": { keys: [k("duduk", 1.6, 1.8)] },
  "salat-berdiri": { keys: [k("duduk", 1.6), k("qiyam", 2.0, 0.6)] },
  "salat-tasyahud-awal": { keys: [k("duduk", 1.6, 2.0)] },
  "salat-tasyahud-akhir": { keys: [k("tasyahud-akhir", 1.8, 2.2)] },
  "salat-salam-kanan": { keys: [k("salam-r", 1.4, 1.2)] },
  "salat-salam-kiri": { keys: [k("tasyahud-akhir", 1.2), k("salam-l", 1.4, 1.2)] },

  // ----- Umum -----
  "return-stand": { keys: [k("stand", 1.6)] },
};

/** Id pose terakhir sebuah klip (pose tempat tubuh berhenti setelah klip selesai). */
export function lastPoseOf(clipId: string): string {
  const clip = CLIPS[clipId];
  if (!clip) throw new Error(`Klip tidak dikenal: ${clipId}`);
  const keys = expandClip(clip);
  return keys[keys.length - 1]!.pose;
}

/** Menguraikan pengulangan menjadi daftar kunci datar. */
export function expandClip(clip: Clip): ClipKey[] {
  if (!clip.loop) return clip.keys;
  const { from, times } = clip.loop;
  const head = clip.keys.slice(0, from);
  const body = clip.keys.slice(from);
  const out = [...head];
  for (let i = 0; i < times; i++) out.push(...body);
  return out;
}

export function clipDuration(clip: Clip): number {
  return expandClip(clip).reduce((sum, key) => sum + key.seconds + (key.hold ?? 0), 0);
}

/** Kecepatan sudut puncak yang diizinkan (rad/detik). Gerakan ibadah harus tenang, tidak terburu-buru. */
export const MAX_ANGULAR_SPEED = 3.0;

/** Lama minimum agar perpindahan dari `a` ke `b` tidak melebihi kecepatan puncak (smoothstep: puncak = 1,5 x rata-rata). */
export function calmSeconds(a: PoseValues, b: PoseValues): number {
  let delta = 0;
  for (const c of CHANNELS) delta = Math.max(delta, Math.abs(b[c] - a[c]));
  return (delta * 1.5) / MAX_ANGULAR_SPEED;
}

interface Segment {
  from: PoseValues;
  to: PoseValues;
  seconds: number;
  hold: number;
}

/**
 * Memutar klip dari pose saat ini. Dapat dialihkan kapan saja ke klip lain tanpa lonjakan, karena
 * klip baru selalu bermula dari pose yang sedang tampil.
 */
export class ClipPlayer {
  private pose: PoseValues;
  private segments: Segment[] = [];
  private index = 0;
  private elapsed = 0;

  constructor(initial: PoseValues = NEUTRAL) {
    this.pose = { ...initial };
  }

  getPose(): PoseValues {
    return this.pose;
  }

  /** Kembali ke pose netral tanpa klip yang berjalan. */
  reset(initial: PoseValues = NEUTRAL): void {
    this.pose = { ...initial };
    this.segments = [];
    this.index = 0;
    this.elapsed = 0;
  }

  get finished(): boolean {
    return this.index >= this.segments.length;
  }

  /**
   * Memutar klip. `clipId` boleh berupa beberapa bagian dipisah "|", dan bagian "pose:<id>" berarti
   * berpindah ke pose itu saja (dipakai untuk memundurkan gerakan sebelum diulang).
   */
  play(clipId: string): void {
    const keys: ClipKey[] = [];
    for (const part of clipId.split("|")) {
      if (part.startsWith("pose:")) {
        keys.push({ pose: part.slice("pose:".length), seconds: 1.2 });
        continue;
      }
      const clip = CLIPS[part];
      if (!clip) throw new Error(`Klip tidak dikenal: ${part}`);
      keys.push(...expandClip(clip));
    }
    let from = { ...this.pose };
    this.segments = keys.map((key) => {
      const to = POSES[key.pose];
      if (!to) throw new Error(`Pose tidak dikenal: ${key.pose}`);
      // Berpindah klip di tengah gerakan bisa berarti jarak sendi yang besar: perpanjang agar tetap tenang.
      const segment: Segment = { from, to, seconds: Math.max(key.seconds, calmSeconds(from, to)), hold: key.hold ?? 0 };
      from = to;
      return segment;
    });
    this.index = 0;
    this.elapsed = 0;
  }

  update(dt: number): PoseValues {
    let remaining = Math.max(0, dt);
    while (remaining > 0 && this.index < this.segments.length) {
      const seg = this.segments[this.index]!;
      const total = seg.seconds + seg.hold;
      const step = Math.min(remaining, total - this.elapsed);
      this.elapsed += step;
      remaining -= step;
      this.pose = blendPoses(seg.from, seg.to, seg.seconds > 0 ? smoothstep(this.elapsed / seg.seconds) : 1);
      if (this.elapsed >= total - 1e-9) {
        this.index++;
        this.elapsed = 0;
      }
    }
    return this.pose;
  }
}
