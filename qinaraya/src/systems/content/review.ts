import { ALLOW_UNREVIEWED } from "../../config/contentPolicy.ts";

/** Status peninjauan konten agama (GDD 11.5). Hanya `approved` yang boleh tampil di produksi. */
export type ReviewStatus = "draft" | "needs-review" | "approved";

export const REVIEW_STATUSES: readonly ReviewStatus[] = ["draft", "needs-review", "approved"];

/**
 * Konten tanpa status (bukan materi agama, misalnya teks sistem) selalu tampil.
 * Selain itu hanya `approved`, kecuali build mengizinkan konten yang belum ditinjau.
 */
export function isVisible(status: ReviewStatus | undefined, allowUnreviewed: boolean = ALLOW_UNREVIEWED): boolean {
  if (status === undefined || status === "approved") return true;
  return allowUnreviewed;
}

export function reviewLabel(status: ReviewStatus): string {
  if (status === "approved") return "Sudah ditinjau";
  if (status === "needs-review") return "Menunggu tinjauan";
  return "Draf";
}
