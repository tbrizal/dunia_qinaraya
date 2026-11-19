import type { GuidedActivity } from "../activities.ts";

/**
 * METADATA AKTIVITAS WUDU DAN SALAT YANG BELUM DITINJAU. Tidak ikut build produksi.
 * Langkah, bacaan Arab, dan urutan gerakan berasal dari panduan (ibadahGuide.ts); animasi 3D dari
 * systems/worship. Aktivitas bersifat belajar: tanpa skor, hadiah, pencatatan, atau penalti.
 */
export const DRAFT_ACTIVITIES: readonly GuidedActivity[] = [
  {
    id: "wudu-practice",
    kind: "wudu",
    title: "Berwudu",
    actionLabel: "Berwudu",
    placeId: "wudu",
    availability: "anytime",
    reviewStatus: "needs-review",
    reviewNotes:
      "WAJIB ditinjau ahli. Isi dan urutan 11 langkah berasal dari panduan sumber. Periksa pelabelan rukun dan sunah (langkah 'membasuh telapak tangan' diberi label sunah karena tidak termasuk enam rukun yang disebut panduan, namun panduan tidak menyebutnya sunah secara eksplisit) dan animasi 3D untuk tiap langkah.",
    closing: "Latihan berwudu selesai. Kamu boleh mengulangnya kapan saja.",
  },
  {
    id: "salat-moment",
    kind: "salat",
    title: "Salat",
    actionLabel: "Salat {prayer}",
    practiceLabel: "Latihan salat",
    placeId: "masjid",
    availability: "prayer-window",
    practiceOutsideWindow: true,
    reviewStatus: "needs-review",
    reviewNotes:
      "WAJIB ditinjau ahli. Urutan salat 2, 3, dan 4 rakaat berasal dari panduan sumber. Perlu dikonfirmasi: (1) bacaan tasyahud awal (panduan tidak merinci terpisah; ditampilkan tasyahud tanpa selawat), (2) posisi duduk tasyahud awal (iftirasy; panduan tidak menyebutnya), (3) posisi tangan setelah iktidal (diturunkan di sisi tubuh; panduan tidak menyebutnya), (4) label salam kedua (tanpa label rukun atau sunah), (5) teks Al-Fatihah dan surah pendek yang tidak ada di panduan, (6) semua animasi gerakan 3D.",
    closing: "Terima kasih sudah berhenti sejenak. Tidak ada nilai atau hadiah untuk ini, dan tidak apa-apa jika kamu memilih bermain dulu.",
    reminderHint: "Kamu bisa berwudu dan salat di masjid, atau lanjut bermain.",
  },
];
