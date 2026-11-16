import type { GuidedActivity } from "../activities.ts";

/**
 * AKTIVITAS TERPANDU YANG BELUM DITINJAU. Tidak ikut build produksi (lihat data/unreviewed/index.ts).
 *
 * Sengaja TANPA animasi gerakan salat atau wudu: detail gerakan ibadah wajib ditinjau pihak yang kompeten
 * (GDD 5.3). Aktivitas ini hanya membimbing pemain langkah demi langkah lewat teks, tanpa skor, hadiah,
 * pencatatan, atau penalti, dan menegaskan bahwa permainan tidak menggantikan ibadah sebenarnya.
 */
export const DRAFT_ACTIVITIES: readonly GuidedActivity[] = [
  {
    id: "wudu-practice",
    kind: "wudu",
    title: "Latihan Berwudu",
    actionLabel: "Berwudu",
    placeId: "wudu",
    availability: "anytime",
    reviewStatus: "needs-review",
    reviewNotes:
      "WAJIB ditinjau ahli. Periksa: anggota dan urutan yang disebut, kalimat tentang niat (sengaja tidak memuat lafaz), catatan perbedaan antar pendapat, dan seluruh teks. Tidak ada bacaan dan tidak ada animasi gerakan.",
    steps: [
      { title: "Bersiap", text: "Pastikan lenganmu bebas dan siapkan air secukupnya. Gunakan air dengan tidak berlebihan." },
      {
        title: "Niat",
        text: "Berwudu dimulai dengan berniat untuk bersuci. Cara meniatkannya bisa kamu tanyakan kepada orang tua atau gurumu.",
      },
      { title: "Wajah", text: "Basuh wajahmu dengan air." },
      { title: "Kedua tangan", text: "Basuh kedua tanganmu sampai siku." },
      { title: "Kepala", text: "Usap kepalamu dengan tangan yang basah." },
      { title: "Kedua kaki", text: "Basuh kedua kakimu sampai mata kaki." },
    ],
    closing:
      "Latihan selesai. Urutan dan rincian wudu bisa sedikit berbeda menurut penjelasan para ulama, jadi ikuti cara yang diajarkan orang tua atau gurumu. Ini hanya latihan mengenal, bukan pengganti belajar langsung. Kamu boleh mengulangnya kapan saja.",
  },
  {
    id: "salat-moment",
    kind: "salat",
    title: "Waktu Salat",
    actionLabel: "Salat {prayer}",
    placeId: "masjid",
    availability: "prayer-window",
    reviewStatus: "needs-review",
    reviewNotes:
      "WAJIB ditinjau ahli. Aktivitas ini sengaja hanya berupa jeda terpandu, bukan simulasi tata cara salat. Periksa seluruh teks, terutama langkah 'Melaksanakan', dan putuskan apakah animasi gerakan (jika diinginkan) boleh dibuat serta bagaimana urutannya.",
    steps: [
      {
        title: "Waktunya tiba",
        text: "Waktu {prayer} sedang berlangsung di Qinaraya (jadwal simulasi). Kamu bisa berhenti sejenak dari kesibukanmu.",
      },
      {
        title: "Bersiap",
        text: "Pastikan dirimu dan tempatnya bersih. Jika belum berwudu, tempat wudu ada di sebelah kiri masjid.",
      },
      {
        title: "Tenang",
        text: "Atur napasmu, bersikaplah tenang, dan hadapkan dirimu ke arah salat sesuai yang diajarkan orang tua atau gurumu.",
      },
      {
        title: "Melaksanakan",
        text: "Salat dilakukan di dunia nyata sesuai tata cara yang diajarkan kepadamu. Di dalam game kita hanya berhenti sejenak bersama-sama; permainan tidak menggantikan ibadah yang sebenarnya.",
      },
      { title: "Selesai", text: "Setelah selesai, rapikan tempatmu dan lanjutkan harimu dengan tenang." },
    ],
    closing:
      "Terima kasih sudah berhenti sejenak. Tidak ada nilai atau hadiah untuk ini, dan tidak apa-apa jika kamu memilih bermain dulu.",
    reminderHint: "Kamu bisa berwudu dan salat di masjid, atau lanjut bermain.",
  },
];
