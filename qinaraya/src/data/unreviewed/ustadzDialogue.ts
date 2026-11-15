import type { DialogueEntry, DialogueNode } from "../dialogues.ts";

/** Dialog materi dan quest Ustadz Harun yang BELUM DITINJAU. Tidak ikut build produksi. */
export const USTADZ_DRAFT_ENTRIES: readonly DialogueEntry[] = [
      { node: "turnin_a", reviewStatus: "draft", when: { questId: "learn_masjid", status: ["ready"] } },
      { node: "turnin_b", reviewStatus: "draft", when: { questId: "learn_wudu", status: ["ready"] } },
      { node: "turnin_c", reviewStatus: "draft", when: { questId: "share_harvest", status: ["ready"] } },
      { node: "reminder_a", reviewStatus: "draft", when: { questId: "learn_masjid", status: ["active"] } },
      { node: "reminder_b", reviewStatus: "draft", when: { questId: "learn_wudu", status: ["active"] } },
      { node: "share_active", reviewStatus: "draft", when: { questId: "share_harvest", status: ["active"] } },
      { node: "intro", reviewStatus: "draft", when: { questId: "learn_masjid", status: ["inactive"] } },
      {
        node: "offer_b",
        reviewStatus: "draft",
        when: [
          { questId: "learn_masjid", status: ["completed"] },
          { questId: "learn_wudu", status: ["inactive"] },
        ],
      },
      {
        node: "need_farm",
        reviewStatus: "draft",
        when: [
          { questId: "learn_wudu", status: ["completed"] },
          { questId: "tutorial_farming", status: ["inactive", "active", "ready"] },
        ],
      },
      {
        node: "offer_c",
        reviewStatus: "draft",
        when: [
          { questId: "learn_wudu", status: ["completed"] },
          { questId: "tutorial_farming", status: ["completed"] },
          { questId: "share_harvest", status: ["inactive"] },
        ],
      },
      { node: "all_done", reviewStatus: "draft", when: { questId: "share_harvest", status: ["completed"] } },
    ];

export const USTADZ_DRAFT_NODES: Record<string, DialogueNode> = {
      intro: {
        text: "Selamat {timeOfDay}, Nak. Aku Ustadz Harun. Aku senang menemani warga belajar kebiasaan baik di desa ini.",
        next: "offer_a",
      },
      offer_a: {
        text: "Maukah kamu berkenalan dengan masjid dan musala? Kamu bisa berjalan-jalan dan membaca cerita singkat di sana. Tidak ada batas waktu.",
        choices: [
          { label: "Mau, Ustadz", next: "started_a", effect: { type: "startQuest", questId: "learn_masjid" } },
          { label: "Nanti saja", next: null },
        ],
      },
      started_a: {
        text: "Terima kasih. Mulailah dari depan masjid ini, lalu kunjungi musala di timur laut desa. Pelan-pelan saja.",
        next: null,
      },
      reminder_a: {
        text: "Silakan lanjutkan jalan-jalanmu. Cerita tentang masjid ada di depan masjid, dan cerita tentang musala ada di musala. Tidak perlu terburu-buru.",
        next: null,
      },
      turnin_a: {
        text: "Kamu sudah berkenalan dengan masjid dan musala. Semoga kamu merasa nyaman berada di sana. Ini lentera sebagai kenang-kenangan.",
        choices: [{ label: "Terima hadiah", next: "done_a", effect: { type: "completeQuest", questId: "learn_masjid" } }],
      },
      done_a: {
        text: "Datanglah lagi kapan saja kalau ingin belajar hal lain.",
        next: null,
      },
      offer_b: {
        text: "Selamat {timeOfDay}. Bagaimana kalau sekarang kita belajar tentang kebersihan dan mengenal wudu? Kamu juga bisa membantu membersihkan halaman masjid.",
        choices: [
          { label: "Mau, Ustadz", next: "started_b", effect: { type: "startQuest", questId: "learn_wudu" } },
          { label: "Nanti saja", next: null },
        ],
      },
      started_b: {
        text: "Cerita tentang wudu ada di tempat wudu, di sebelah kiri masjid. Halaman masjid bisa dibersihkan dari depan masjid. Cerita tentang waktu salat ada di panel jam di kiri atas layarmu.",
        next: null,
      },
      reminder_b: {
        text: "Tempat wudu ada di sebelah kiri masjid. Halaman bisa dibersihkan dari depan masjid. Panel jam di kiri atas layar berisi cerita tentang waktu salat.",
        next: null,
      },
      turnin_b: {
        text: "Terima kasih sudah ikut menjaga kebersihan dan mau belajar. Ini pot bunga untuk menghiasi rumahmu.",
        choices: [{ label: "Terima hadiah", next: "done_b", effect: { type: "completeQuest", questId: "learn_wudu" } }],
      },
      done_b: {
        text: "Lingkungan yang bersih membuat semua orang nyaman. Terima kasih ya.",
        next: null,
      },
      need_farm: {
        text: "Selamat {timeOfDay}. Kalau kebunmu sudah menghasilkan panen, datanglah lagi. Ada kegiatan berbagi untuk dapur warga yang ingin kuajak kamu ikut serta.",
        next: null,
      },
      offer_c: {
        text: "Kebunmu sudah berbuah. Dapur warga sedang menyiapkan makanan untuk tetangga. Maukah kamu membagikan sebagian hasil panenmu?",
        choices: [
          { label: "Mau, Ustadz", next: "share_active", effect: { type: "startQuest", questId: "share_harvest" } },
          { label: "Nanti saja", next: null },
        ],
      },
      share_active: {
        text: "Hasil panen apa pun boleh. Berbagi tidak harus banyak, yang penting dilakukan dengan senang hati. Siap membagikan 2 hasil panen?",
        choices: [
          { label: "Bagikan 2 hasil panen", next: "shared", effect: { type: "donateCrops", quantity: 2 } },
          { label: "Nanti saja", next: null },
        ],
      },
      shared: {
        text: "Terima kasih banyak! Tetangga kita pasti senang menerimanya. Datanglah lagi untuk menerima hadiah kecil.",
        next: null,
      },
      turnin_c: {
        text: "Kamu sudah berbagi dengan warga. Semoga kebaikan kecil seperti ini terus tumbuh. Ini bangku kayu untuk halaman rumahmu.",
        choices: [{ label: "Terima hadiah", next: "done_c", effect: { type: "completeQuest", questId: "share_harvest" } }],
      },
      done_c: {
        text: "Terima kasih sudah menjadi tetangga yang baik.",
        next: null,
      },
      all_done: {
        text: "Selamat {timeOfDay}, Nak. Semua cerita yang kusiapkan sudah kamu jelajahi. Kapan pun ingin mampir ke masjid, pintunya selalu terbuka.",
        next: null,
      },
    };
