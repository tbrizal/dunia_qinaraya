/**
 * Tipe dan registri materi ibadah (panduan wudu dan salat). Isinya dimuat saat boot hanya pada
 * build yang mengizinkan konten belum ditinjau (lihat data/unreviewed), jadi modul ini
 * tidak memuat satu pun teks ibadah.
 */

/** Blok hasil ekstraksi otomatis dari panduan sumber (docs/source). */
export type GuideBlock =
  | { type: "text"; text: string }
  | { type: "note"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; rows: string[][] }
  | { type: "translit"; text: string }
  | { type: "recitation"; label?: string; arab?: string; translit: string; arti: string };

export interface GuideSection {
  level: number;
  title: string;
  blocks: GuideBlock[];
}

// ---------- Model game (disusun dari panduan; lihat data/unreviewed/ibadahGuide.ts) ----------

export interface Recitation {
  id: string;
  /** Nama bacaan untuk judul kecil di UI. */
  label: string;
  /** Teks Arab persis seperti di panduan sumber. Kosong bila panduan hanya memberi transliterasi. */
  arab?: string;
  translit: string;
  arti: string;
}

/** rukun / sunah dibedakan sesuai panduan; info untuk langkah peralihan yang tidak diberi label. */
export type StepKind = "rukun" | "sunah" | "info";

export interface StepRecitation {
  recitation: Recitation;
  /** Kalimat pengantar yang ditampilkan di atas bacaan ini. */
  lead?: string;
}

export interface WorshipStepView {
  id: string;
  title: string;
  kind: StepKind;
  instruction: string;
  notes: string[];
  recitations: StepRecitation[];
  /** Id klip animasi 3D (lihat systems/worship/poses.ts). */
  clip: string;
  /** Pengingat bahwa teks bacaan tertentu tidak ada di panduan sumber. */
  missingText?: string;
  /** Hanya untuk salat. */
  indicator?: { rakaat: number; totalRakaat: number; position: string };
}

export interface MovementDef {
  title: string;
  kind: StepKind;
  instruction: string;
  notes: string[];
  recitations: StepRecitation[];
  clip: string;
  missingText?: string;
}

export type PrayerId = "subuh" | "dzuhur" | "ashar" | "maghrib" | "isya";

export interface PrayerRakaat {
  prayer: PrayerId;
  /** Nama sesuai panduan (Zuhur, Asar, Magrib). */
  name: string;
  rakaat: number;
  note: string;
}

export interface WorshipGuide {
  /** Catatan pembuka dari panduan (dasar mazhab dan sifat materi). */
  disclaimer: string;
  /** Prinsip penutup: panduan belajar, bukan pengganti bimbingan guru. */
  closingPrinciple: string;
  recitations: Record<string, Recitation>;
  wuduSteps: MovementDef[];
  /** Gerakan salat dasar, dipakai ulang tiap rakaat. */
  movements: Record<string, MovementDef>;
  prayers: PrayerRakaat[];
  /** Kalimat panduan yang dipakai pengurut salat (kata-kata asli panduan). */
  phrases: {
    tumakninah: string;
    standToThird: string;
    standToFourth: string;
    standToSecond: string;
    fatihahOnly: string;
    tasyahudAwalSit: string;
    tasyahudAwalSunah: string;
    sujudRepeat: string;
    prayerDone: string;
  };
}

let guide: WorshipGuide | null = null;

export function registerWorshipGuide(g: WorshipGuide): void {
  guide = g;
}

/** Null pada build produksi (panduan tidak dimuat). */
export function getWorshipGuide(): WorshipGuide | null {
  return guide;
}
