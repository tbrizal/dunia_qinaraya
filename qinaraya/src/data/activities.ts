import { isVisible } from "../systems/content/review.ts";
import type { ReviewStatus } from "../systems/content/review.ts";

/**
 * Aktivitas terpandu wudu dan salat. Langkah, bacaan, dan animasi 3D-nya berasal dari panduan ibadah
 * (data/unreviewed/ibadahGuide.ts); entri di sini hanya metadata: lokasi, ketersediaan, dan status review.
 * Tanpa skor, tanpa hadiah, tanpa pencatatan "sudah salat", dan tanpa penalti bila tidak dilakukan.
 * Konten ini berstatus belum ditinjau dan tidak ikut build produksi. Registri diisi saat boot.
 */

export type ActivityKind = "wudu" | "salat";

export interface GuidedActivity {
  id: string;
  kind: ActivityKind;
  title: string;
  /** Label tombol aksi. Boleh memakai {prayer}. */
  actionLabel: string;
  /** Label tombol di luar waktu salat bila `practiceOutsideWindow` aktif. */
  practiceLabel?: string;
  /** Lokasi tempat aktivitas ini tersedia. */
  placeId: string;
  /** "prayer-window": salat sesungguhnya hanya saat waktunya sedang berlangsung. */
  availability: "anytime" | "prayer-window";
  /** Di luar waktu salat tetap tersedia sebagai latihan (pemain memilih salat yang dipelajari). */
  practiceOutsideWindow?: boolean;
  reviewStatus: ReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes: string;
  /** Teks penutup setelah langkah terakhir (tambahan dari pengembang, selain prinsip penutup panduan). */
  closing: string;
  /** Kalimat tambahan pada pengingat waktu salat bila aktivitas ini tersedia. */
  reminderHint?: string;
}

export const ACTIVITIES: GuidedActivity[] = [];

export function registerActivities(items: readonly GuidedActivity[]): void {
  for (const item of items) if (!ACTIVITIES.some((a) => a.id === item.id)) ACTIVITIES.push(item);
}

export function getActivity(id: string): GuidedActivity | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}

/** Aktivitas hanya dikembalikan bila boleh tampil pada build ini. */
export function getVisibleActivity(id: string, allowUnreviewed?: boolean): GuidedActivity | undefined {
  const activity = getActivity(id);
  return activity && isVisible(activity.reviewStatus, allowUnreviewed) ? activity : undefined;
}
