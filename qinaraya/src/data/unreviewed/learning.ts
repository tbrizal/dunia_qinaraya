import type { LearningContent } from "../learning.ts";

/**
 * MATERI EDUKASI YANG BELUM DITINJAU (draft / needs-review).
 * Modul ini TIDAK ikut dalam build produksi: hanya dimuat lewat dynamic import saat build
 * mengizinkan konten belum ditinjau (development atau build uji). Lihat docs/CONTENT_REVIEW.md.
 *
 * Aturan penulisan: tanpa kutipan ayat atau hadis, narasi nilai umum, tidak menyajikan perbedaan
 * rincian ibadah sebagai satu-satunya pendapat, dan tidak mengklaim permainan menggantikan ibadah.
 * Setelah ditinjau, pindahkan materi ke data/learning.ts dengan reviewStatus "approved",
 * reviewedBy, dan reviewedAt.
 */

export const DRAFT_LEARNING_CONTENT: readonly LearningContent[] = [
  {
    id: "masjid-intro",
    title: "Mengenal Masjid",
    shortTitle: "Mengenal masjid",
    category: "masjid",
    description: "Pengenalan masjid sebagai tempat ibadah dan tempat warga berkumpul.",
    npcId: "ustadz-harun",
    questId: "learn_masjid",
    ageLevel: "early",
    reviewStatus: "draft",
    reviewNotes: "Periksa kesesuaian istilah dan gambaran umum masjid. Tidak ada kutipan teks agama.",
    pages: [
      "Masjid adalah tempat ibadah umat Islam. Di Qinaraya, Masjid Qinaraya juga menjadi tempat warga berkumpul dan saling membantu.",
      "Di masjid ada ruang utama untuk beribadah, tempat berwudu, dan menara. Bentuk masjid bisa berbeda-beda di setiap tempat.",
      "Karena dipakai bersama, masjid dijaga bersih dan nyaman oleh banyak orang. Kamu juga bisa ikut menjaganya.",
    ],
  },
  {
    id: "masjid-adab",
    title: "Adab di Masjid",
    shortTitle: "Adab di masjid",
    category: "adab",
    description: "Kebiasaan baik saat berada di masjid.",
    npcId: "ustadz-harun",
    questId: "learn_masjid",
    ageLevel: "early",
    reviewStatus: "draft",
    reviewNotes: "Periksa daftar adab dan kalimat terakhir (doa tidak dikutip, hanya dirujuk ke orang tua atau guru).",
    pages: [
      "Adab artinya kebiasaan baik. Saat berada di masjid, kita berusaha bersikap tenang dan sopan.",
      "Contoh adab di masjid: datang dalam keadaan bersih, tidak berlari atau berteriak, dan menghormati orang yang sedang beribadah.",
      "Alas kaki diletakkan dengan rapi di tempat yang disediakan, dan sampah dibuang ke tempatnya.",
      "Doa atau bacaan khusus saat masuk masjid bisa kamu tanyakan kepada orang tua atau gurumu.",
    ],
  },
  {
    id: "wudu-intro",
    title: "Mengenal Wudu",
    shortTitle: "Mengenal wudu",
    category: "wudu",
    description: "Pengenalan umum tentang wudu sebagai cara bersuci dengan air.",
    npcId: "ustadz-harun",
    questId: "learn_wudu",
    ageLevel: "middle",
    reviewStatus: "needs-review",
    reviewNotes:
      "WAJIB ditinjau ahli. Periksa kalimat tentang anggota wudu secara umum dan catatan perbedaan rincian antar pendapat ulama. Tidak ada urutan langkah rinci dan tidak ada bacaan.",
    pages: [
      "Wudu adalah cara bersuci dengan air sebelum melaksanakan salat.",
      "Secara umum, wudu dilakukan dengan membasuh wajah, membasuh kedua tangan, mengusap kepala, dan membasuh kedua kaki.",
      "Rincian urutan dan bagian yang dianjurkan bisa sedikit berbeda menurut penjelasan para ulama. Karena itu, belajarlah cara berwudu langsung dari orang tua atau gurumu.",
      "Gunakan air secukupnya, tidak berlebihan. Di Qinaraya kamu hanya mengenal wudu lewat cerita singkat; ini bukan pengganti belajar langsung.",
    ],
  },
  {
    id: "prayer-times",
    title: "Mengenal Waktu Salat",
    shortTitle: "Mengenal waktu salat",
    category: "waktu-salat",
    description: "Pengenalan lima waktu salat dan catatan bahwa jadwal di game adalah simulasi.",
    npcId: "ustadz-harun",
    questId: "learn_wudu",
    ageLevel: "middle",
    reviewStatus: "needs-review",
    reviewNotes: "WAJIB ditinjau ahli. Periksa penjelasan waktu salat dan penegasan bahwa jadwal game hanyalah simulasi.",
    pages: [
      "Umat Islam melaksanakan salat lima waktu: Subuh, Dzuhur, Ashar, Magrib, dan Isya.",
      "Di dunia nyata, waktu salat bergantung pada posisi matahari di tempatmu, jadi jadwalnya berbeda di tiap daerah dan tiap hari.",
      "Jam di Qinaraya adalah jadwal simulasi yang dibuat untuk permainan. Untuk waktu salat yang sebenarnya, ikuti jadwal dari masjid atau lembaga di daerahmu.",
      "Di Qinaraya tidak ada hukuman jika kamu sedang sibuk bermain. Pengingat hanya untuk membantumu mengenal waktu.",
    ],
  },
];