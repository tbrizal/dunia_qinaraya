import type { QuestDef } from "../quests.ts";

/** Quest pembelajaran Islami yang BELUM DITINJAU. Tidak ikut build produksi (lihat data/unreviewed/index.ts). */
export const DRAFT_QUESTS: Record<string, QuestDef> = {
  learn_masjid: {
    id: "learn_masjid",
    title: "Berkenalan dengan Masjid",
    summary: "Berkenalan dengan Masjid Qinaraya bersama Ustadz Harun, lalu pelajari kebiasaan baik di sana.",
    category: "islamic-learning",
    reviewStatus: "draft",
    giverNpcId: "ustadz-harun",
    startHint: "Temui Ustadz Harun di depan Masjid Qinaraya, utara desa.",
    legacyObjectiveLayouts: { 3: ["learn-masjid-intro", "learn-masjid-adab", "learn-musala-intro"] },
    objectives: [
      { id: "learn-masjid-intro", type: "learn", count: 1, targetId: "masjid-intro", label: "Pelajari tentang masjid (di depan masjid)" },
      { id: "learn-masjid-adab", type: "learn", count: 1, targetId: "masjid-adab", label: "Pelajari adab di masjid (di depan masjid)" },
    ],
    startItems: [],
    rewardItems: [{ itemId: "lantern", quantity: 1 }],
  },
  learn_wudu: {
    id: "learn_wudu",
    title: "Bersih dan Bersuci",
    summary: "Mengenal dan berlatih wudu, menjaga kebersihan masjid, dan mengenal waktu salat di Qinaraya.",
    category: "islamic-learning",
    reviewStatus: "draft",
    requires: ["learn_masjid"],
    giverNpcId: "ustadz-harun",
    startHint: "Temui Ustadz Harun lagi untuk misi berikutnya.",
    legacyObjectiveLayouts: { 3: ["learn-wudu-intro", "clean-yard", "learn-prayer-times"] },
    objectives: [
      { id: "learn-wudu-intro", type: "learn", count: 1, targetId: "wudu-intro", label: "Pelajari wudu di tempat wudu" },
      { id: "practice-wudu", type: "practice", count: 1, targetId: "wudu-practice", label: "Berlatih berwudu di tempat wudu (latihan mengenal)" },
      { id: "clean-yard", type: "clean", count: 3, label: "Bersihkan halaman masjid" },
      { id: "learn-prayer-times", type: "learn", count: 1, targetId: "prayer-times", label: "Buka panel jam di kiri atas dan pelajari waktu salat" },
    ],
    startItems: [],
    rewardItems: [{ itemId: "flower_pot", quantity: 1 }],
  },
  share_harvest: {
    id: "share_harvest",
    title: "Berbagi Hasil Kebun",
    summary: "Bagikan sebagian hasil panenmu untuk dapur warga yang dikelola Ustadz Harun.",
    category: "islamic-learning",
    reviewStatus: "draft",
    requires: ["tutorial_farming", "learn_masjid"],
    giverNpcId: "ustadz-harun",
    startHint: "Selesaikan misi kebun dan temui Ustadz Harun untuk misi berbagi.",
    objectives: [{ id: "give-crops", type: "give", count: 2, label: "Bagikan 2 hasil panen untuk dapur warga" }],
    startItems: [],
    rewardItems: [{ itemId: "wooden_bench", quantity: 1 }],
  },
};
