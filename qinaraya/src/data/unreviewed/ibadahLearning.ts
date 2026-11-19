import type { LearningContent } from "../learning.ts";
import type { GuideBlock, GuideSection } from "../worship.ts";
import { GUIDE_SECTIONS } from "./ibadahGuide.generated.ts";

/**
 * Materi baca yang disusun dari bagian daftar dan penjelasan pada panduan (rukun, pembatal wudu, lima waktu
 * salat, dan seterusnya). Seluruh kalimat diambil dari panduan; di sini hanya dipilih dan dikelompokkan.
 * BELUM DITINJAU; tidak ikut build produksi.
 */

function section(title: string): GuideSection {
  const found = GUIDE_SECTIONS.find((s) => s.title === title);
  if (!found) throw new Error(`Bagian panduan tidak ditemukan: ${title}`);
  return found;
}

function render(block: GuideBlock): string {
  switch (block.type) {
    case "text":
    case "note":
    case "translit":
      return block.text;
    case "list":
      return block.items.map((item, i) => (block.ordered ? `${i + 1}. ${item}` : `• ${item}`)).join("\n");
    case "table": {
      const [, ...rows] = block.rows;
      return rows.map((row) => `${row[0]}: ${row[1]} rakaat. ${row[2] ?? ""}`.trim()).join("\n");
    }
    case "recitation":
      return block.translit;
  }
}

/** Satu halaman dari beberapa blok sebuah bagian, dipisahkan baris kosong. */
function page(title: string, indexes: number[]): string {
  const blocks = section(title).blocks;
  return indexes.map((i) => render(blocks[i] ?? (() => { throw new Error(`${title}[${i}] tidak ada`); })())).join("\n\n");
}

const NOTES = "Seluruh isi halaman diambil dari panduan sumber (docs/source). Periksa kecocokan dan kelengkapan; tidak ada kalimat karangan.";

export function buildGuideLearning(): LearningContent[] {
  const base = { ageLevel: "family" as const, reviewStatus: "needs-review" as const, reviewNotes: NOTES, npcId: "ustadz-harun" };
  return [
    {
      ...base,
      id: "wudu-intro",
      title: "Mengenal Wudu",
      shortTitle: "Mengenal wudu",
      category: "wudu",
      description: "Pengertian wudu dan persiapan sebelum berwudu.",
      questId: "learn_wudu",
      pages: [page("1.1 Pengertian dan tujuan", [0]), `Persiapan sebelum berwudu:\n${page("1.2 Persiapan", [0])}`],
    },
    {
      ...base,
      id: "wudu-rukun",
      title: "Rukun Wudu",
      shortTitle: "Rukun wudu",
      category: "wudu",
      description: "Rukun wudu menurut panduan.",
      pages: [page("1.4 Rukun wudhu", [0, 1]), page("1.4 Rukun wudhu", [2])],
    },
    {
      ...base,
      id: "wudu-pembatal",
      title: "Hal yang Membatalkan Wudu",
      shortTitle: "Pembatal wudu",
      category: "wudu",
      description: "Hal-hal yang membatalkan wudu menurut panduan.",
      pages: [page("1.5 Hal yang membatalkan wudhu", [0, 1]), page("1.5 Hal yang membatalkan wudhu", [2])],
    },
    {
      ...base,
      id: "salat-persiapan",
      title: "Persiapan Sebelum Salat",
      shortTitle: "Persiapan salat",
      category: "salat",
      description: "Hal yang perlu disiapkan sebelum salat.",
      pages: [page("2.1 Persiapan sebelum salat", [0, 1])],
    },
    {
      ...base,
      id: "salat-rakaat",
      title: "Salat Lima Waktu dan Jumlah Rakaat",
      shortTitle: "Lima waktu dan rakaat",
      category: "salat",
      description: "Jumlah rakaat tiap salat wajib.",
      pages: [page("3. Salat Wajib Lima Waktu", [0])],
    },
    {
      ...base,
      id: "salat-rukun",
      title: "Rukun Salat",
      shortTitle: "Rukun salat",
      category: "salat",
      description: "Rukun salat menurut mazhab Syafi'i dan arti tumakninah.",
      pages: [page("4. Rukun Salat Menurut Mazhab Syafi'i", [0, 1]), page("4. Rukun Salat Menurut Mazhab Syafi'i", [2])],
    },
    {
      ...base,
      id: "salat-sunah",
      title: "Sunah dan Hal yang Perlu Diperhatikan",
      shortTitle: "Sunah salat",
      category: "salat",
      description: "Sunah dan catatan penting dalam salat.",
      pages: [page("5. Sunah dan Hal yang Perlu Diperhatikan", [0])],
    },
    {
      ...base,
      id: "ibadah-sumber",
      title: "Sumber Panduan",
      shortTitle: "Sumber panduan",
      category: "sumber",
      description: "Rujukan dalil dan sumber belajar yang disebut panduan.",
      pages: [
        `Al-Qur'an\n${page("Al-Qur'an", [0])}`,
        `Hadis\n${page("Hadis", [0])}`,
        `Rujukan pembelajaran Indonesia\n${page("Rujukan pembelajaran Indonesia", [0])}`,
      ],
    },
  ];
}
