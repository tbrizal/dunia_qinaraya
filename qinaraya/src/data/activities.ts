import { isVisible } from "../systems/content/review.ts";
import type { ReviewStatus } from "../systems/content/review.ts";

/**
 * Aktivitas terpandu (latihan wudu, jeda salat). Berupa langkah-langkah teks yang dibaca pemain,
 * tanpa animasi gerakan ibadah, tanpa skor, tanpa hadiah, dan tanpa penalti bila tidak dilakukan.
 *
 * Teks aktivitas adalah konten agama: berstatus draft atau needs-review dan disimpan di
 * data/unreviewed (tidak ikut build produksi). Registri ini diisi saat boot.
 */

export type ActivityKind = "wudu" | "salat";

export interface ActivityStep {
  title: string;
  /** Boleh memakai {prayer} (nama waktu salat yang sedang berlangsung). */
  text: string;
}

export interface GuidedActivity {
  id: string;
  kind: ActivityKind;
  title: string;
  /** Label tombol aksi. Boleh memakai {prayer}. */
  actionLabel: string;
  /** Lokasi tempat aktivitas ini tersedia. */
  placeId: string;
  /** "prayer-window" berarti hanya tersedia saat waktu salat sedang berlangsung. */
  availability: "anytime" | "prayer-window";
  reviewStatus: ReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes: string;
  steps: readonly ActivityStep[];
  /** Teks penutup setelah langkah terakhir. */
  closing: string;
  /** Kalimat tambahan pada pengingat waktu salat bila aktivitas ini tersedia. Tersimpan di sini agar ikut gerbang review. */
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
