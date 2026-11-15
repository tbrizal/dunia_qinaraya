import { isVisible } from "../systems/content/review.ts";
import type { ReviewStatus } from "../systems/content/review.ts";

/**
 * Registri materi edukasi. Hanya materi yang SUDAH DITINJAU (approved) boleh ditulis langsung di sini
 * (saat ini belum ada). Materi draft ada di data/unreviewed dan didaftarkan saat runtime hanya
 * pada build yang mengizinkannya, sehingga teksnya tidak ikut terkirim di build produksi.
 */

export type LearningCategory = "masjid" | "adab" | "wudu" | "waktu-salat";
export type AgeLevel = "early" | "middle" | "family";

export interface LearningContent {
  id: string;
  title: string;
  /** Label pendek untuk tombol aksi. */
  shortTitle: string;
  category: LearningCategory;
  description: string;
  npcId?: string;
  questId?: string;
  ageLevel: AgeLevel;
  reviewStatus: ReviewStatus;
  /** Wajib diisi bila reviewStatus approved. */
  reviewedBy?: string;
  reviewedAt?: string;
  /** Catatan untuk reviewer: apa yang perlu diperiksa. */
  reviewNotes: string;
  /** Halaman singkat yang dibaca pemain satu per satu. */
  pages: readonly string[];
}

/** Diisi saat boot. Array yang sama dipakai semua modul, jadi pendaftaran terlihat di mana-mana. */
export const LEARNING_CONTENT: LearningContent[] = [];

/** Mendaftarkan materi (tanpa duplikat id). */
export function registerLearningContent(items: readonly LearningContent[]): void {
  for (const item of items) if (!LEARNING_CONTENT.some((c) => c.id === item.id)) LEARNING_CONTENT.push(item);
}

export function getLearningContent(id: string): LearningContent | undefined {
  return LEARNING_CONTENT.find((c) => c.id === id);
}

/** Konten hanya dikembalikan bila boleh tampil pada build ini. */
export function getVisibleLearningContent(id: string, allowUnreviewed?: boolean): LearningContent | undefined {
  const content = getLearningContent(id);
  return content && isVisible(content.reviewStatus, allowUnreviewed) ? content : undefined;
}
