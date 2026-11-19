import type { GuideBlock, GuideSection, MovementDef, PrayerId, PrayerRakaat, Recitation, StepKind, StepRecitation, WorshipGuide } from "../worship.ts";
import { GUIDE_SECTIONS } from "./ibadahGuide.generated.ts";

/**
 * Menyusun model game dari panduan wudu dan salat (diekstrak otomatis). Semua kalimat petunjuk, bacaan
 * Arab, transliterasi, dan arti diambil dari panduan; di sini hanya dipilih dan diberi label/animasi.
 * Teks yang ditulis pengembang dibatasi pada judul, label, dan catatan penghubung yang ditandai di bawah.
 * BELUM DITINJAU; tidak ikut build produksi.
 */

function section(title: string): GuideSection {
  const found = GUIDE_SECTIONS.find((s) => s.title === title);
  if (!found) throw new Error(`Bagian panduan tidak ditemukan: ${title}`);
  return found;
}

function textAt(title: string, index: number): string {
  const block: GuideBlock | undefined = section(title).blocks[index];
  if (!block || (block.type !== "text" && block.type !== "translit")) throw new Error(`${title}[${index}] bukan teks`);
  return block.text;
}

function listAt(title: string, index: number): string[] {
  const block = section(title).blocks[index];
  if (!block || block.type !== "list") throw new Error(`${title}[${index}] bukan daftar`);
  return block.items;
}

function recAt(title: string, index: number, id: string, label: string): Recitation {
  const block = section(title).blocks[index];
  if (!block || block.type !== "recitation") throw new Error(`${title}[${index}] bukan bacaan`);
  return { id, label, ...(block.arab ? { arab: block.arab } : {}), translit: block.translit, arti: block.arti };
}

const stripColon = (s: string) => s.replace(/:\s*$/, "");

// ---------- Bacaan (persis dari panduan) ----------

const W = "1.3 Urutan wudhu";
void W;
const recitationList: Recitation[] = [
  recAt("1. Niat", 2, "wudu-niat", "Lafal niat wudu"),
  recAt("2. Membaca basmalah", 0, "basmalah", "Basmalah"),
  recAt("11. Membaca doa setelah wudhu", 0, "doa-setelah-wudu", "Doa setelah wudu"),
  recAt("11. Membaca doa setelah wudhu", 2, "doa-tawwabin", "Tambahan doa dari hadis"),
  recAt("1. Berdiri dan niat", 1, "niat-subuh", "Contoh niat salat Subuh"),
  recAt("2. Takbiratul ihram", 1, "takbir", "Takbiratul ihram"),
  recAt("3. Doa iftitah (sunah)", 1, "iftitah", "Doa iftitah"),
  recAt("4. Membaca taawuz dan Surah Al-Fatihah", 0, "taawuz", "Taawuz"),
  recAt("6. Rukuk", 2, "rukuk", "Tasbih rukuk"),
  recAt("7. Iktidal", 1, "sami-allah", "Saat bangkit dari rukuk"),
  recAt("7. Iktidal", 3, "rabbana-lakal-hamd", "Saat berdiri tegak"),
  recAt("8. Sujud pertama", 3, "sujud", "Tasbih sujud"),
  recAt("9. Duduk di antara dua sujud", 2, "duduk-antara-sujud", "Doa di antara dua sujud"),
  recAt("18. Duduk tasyahud akhir", 2, "tasyahud", "Tasyahud"),
  recAt("18. Duduk tasyahud akhir", 4, "selawat", "Selawat Ibrahimiyah"),
  recAt("19. Salam", 1, "salam", "Salam"),
];
const R: Record<string, Recitation> = Object.fromEntries(recitationList.map((r) => [r.id, r]));
const rec = (id: string, lead?: string): StepRecitation => ({ recitation: R[id]!, ...(lead ? { lead } : {}) });

// ---------- Wudu: 11 langkah ----------

interface WuduSpec {
  title: string;
  kind: StepKind;
  clip: string;
  instruction: string;
  notes?: string[];
  recitations?: StepRecitation[];
}

const wuduSpecs: WuduSpec[] = [
  {
    title: "Niat",
    kind: "rukun",
    clip: "wudu-niat",
    instruction: textAt("1. Niat", 0),
    recitations: [rec("wudu-niat", stripColon(textAt("1. Niat", 1)))],
    notes: [textAt("1. Niat", 3)],
  },
  { title: "Membaca basmalah", kind: "sunah", clip: "wudu-basmalah", instruction: "", recitations: [rec("basmalah")] },
  { title: "Membasuh kedua telapak tangan", kind: "sunah", clip: "wudu-hands", instruction: textAt("3. Membasuh kedua telapak tangan", 0) },
  { title: "Berkumur-kumur", kind: "sunah", clip: "wudu-mouth", instruction: textAt("4. Berkumur-kumur", 0) },
  { title: "Membersihkan hidung", kind: "sunah", clip: "wudu-nose", instruction: textAt("5. Membersihkan hidung", 0) },
  { title: "Membasuh wajah", kind: "rukun", clip: "wudu-face", instruction: textAt("6. Membasuh wajah", 0) },
  { title: "Membasuh kedua tangan sampai siku", kind: "rukun", clip: "wudu-arms", instruction: textAt("7. Membasuh kedua tangan sampai siku", 0) },
  { title: "Mengusap sebagian kepala", kind: "rukun", clip: "wudu-head", instruction: textAt("8. Mengusap sebagian kepala", 0) },
  { title: "Mengusap kedua telinga", kind: "sunah", clip: "wudu-ears", instruction: textAt("9. Mengusap kedua telinga", 0) },
  { title: "Membasuh kedua kaki sampai mata kaki", kind: "rukun", clip: "wudu-feet", instruction: textAt("10. Membasuh kedua kaki sampai mata kaki", 0) },
  {
    title: "Membaca doa setelah wudu",
    kind: "sunah",
    clip: "wudu-dua",
    instruction: "",
    recitations: [rec("doa-setelah-wudu"), rec("doa-tawwabin", stripColon(textAt("11. Membaca doa setelah wudhu", 1)))],
  },
];

const wuduSteps: MovementDef[] = wuduSpecs.map((s) => ({
  title: s.title,
  kind: s.kind,
  instruction: s.instruction,
  notes: s.notes ?? [],
  recitations: s.recitations ?? [],
  clip: s.clip,
}));

// ---------- Salat: gerakan dasar ----------

const TUMAKNINAH = (() => {
  const blocks = section("4. Rukun Salat Menurut Mazhab Syafi'i").blocks;
  const t = blocks.find((b) => b.type === "text" && b.text.startsWith("Tumakninah"));
  if (!t || t.type !== "text") throw new Error("Kalimat tumakninah tidak ditemukan");
  return t.text;
})();

const SUJUD_NOTE = textAt("8. Sujud pertama", 4);
const FATIHAH_SENTENCE = textAt("12. Membaca Al-Fatihah dan surah", 0); // "Baca Surah Al-Fatihah, kemudian disunahkan membaca surah atau ayat Al-Qur'an."
const [FATIHAH_PART, SURAH_PART] = (() => {
  const [a, b] = FATIHAH_SENTENCE.split(", kemudian ");
  if (!a || !b) throw new Error("Kalimat Al-Fatihah dan surah berubah bentuk");
  return [`${a}.`, `${b.charAt(0).toUpperCase()}${b.slice(1)}`];
})();

const sec31 = "3.1 Pola salat tiga rakaat";
const sec32 = "3.2 Pola salat empat rakaat";
const findItem = (title: string, startsWith: string): string => {
  const block = section(title).blocks.find((b) => b.type === "list");
  const item = block && block.type === "list" ? block.items.find((i) => i.startsWith(startsWith)) : undefined;
  if (!item) throw new Error(`${title}: butir "${startsWith}" tidak ditemukan`);
  return item;
};

const MISSING_FATIHAH =
  "Teks Al-Fatihah tidak disertakan di panduan sumber. Bacalah dari mushaf atau dengan bimbingan guru.";
const MISSING_SURAH = "Teks surah pendek tidak disertakan di panduan sumber. Bacalah dari mushaf atau dengan bimbingan guru.";

const movements: Record<string, MovementDef> = {
  niat: {
    title: "Berdiri dan niat",
    kind: "rukun",
    instruction: textAt("1. Berdiri dan niat", 0),
    notes: [textAt("1. Berdiri dan niat", 2)],
    recitations: [],
    clip: "salat-niat",
  },
  takbir: {
    title: "Takbiratul ihram",
    kind: "rukun",
    instruction: textAt("2. Takbiratul ihram", 0),
    notes: [textAt("2. Takbiratul ihram", 2)],
    recitations: [rec("takbir")],
    clip: "salat-takbir",
  },
  iftitah: {
    title: "Doa iftitah",
    kind: "sunah",
    instruction: textAt("3. Doa iftitah (sunah)", 0),
    notes: [textAt("3. Doa iftitah (sunah)", 2)],
    recitations: [rec("iftitah")],
    clip: "salat-sedekap",
  },
  taawuz: { title: "Membaca taawuz", kind: "sunah", instruction: "", notes: [], recitations: [rec("taawuz")], clip: "salat-sedekap" },
  fatihah: {
    title: "Membaca Al-Fatihah",
    kind: "rukun",
    instruction: textAt("4. Membaca taawuz dan Surah Al-Fatihah", 1),
    notes: [textAt("4. Membaca taawuz dan Surah Al-Fatihah", 2)],
    recitations: [],
    clip: "salat-sedekap",
    missingText: MISSING_FATIHAH,
  },
  "fatihah-lanjut": {
    title: "Membaca Al-Fatihah",
    kind: "rukun",
    instruction: FATIHAH_PART,
    notes: [],
    recitations: [],
    clip: "salat-sedekap",
    missingText: MISSING_FATIHAH,
  },
  surah: {
    title: "Membaca surah atau ayat Al-Qur'an",
    kind: "sunah",
    instruction: textAt("5. Membaca surah atau ayat Al-Qur'an", 0),
    notes: [],
    recitations: [],
    clip: "salat-sedekap",
    missingText: MISSING_SURAH,
  },
  "surah-lanjut": {
    title: "Membaca surah atau ayat Al-Qur'an",
    kind: "sunah",
    instruction: SURAH_PART,
    notes: [],
    recitations: [],
    clip: "salat-sedekap",
    missingText: MISSING_SURAH,
  },
  rukuk: {
    title: "Rukuk",
    kind: "rukun",
    instruction: textAt("6. Rukuk", 0),
    notes: [textAt("6. Rukuk", 3), TUMAKNINAH],
    recitations: [rec("rukuk", stripColon(textAt("6. Rukuk", 1)))],
    clip: "salat-rukuk",
  },
  iktidal: {
    title: "Iktidal",
    kind: "rukun",
    instruction: textAt("7. Iktidal", 0),
    notes: [TUMAKNINAH],
    recitations: [rec("sami-allah"), rec("rabbana-lakal-hamd", stripColon(textAt("7. Iktidal", 2)))],
    clip: "salat-iktidal",
  },
  "sujud-1": {
    title: "Sujud pertama",
    kind: "rukun",
    instruction: `${textAt("8. Sujud pertama", 0)}\n${listAt("8. Sujud pertama", 1).map((i) => `• ${i}`).join("\n")}`,
    notes: [SUJUD_NOTE, TUMAKNINAH],
    recitations: [rec("sujud", stripColon(textAt("8. Sujud pertama", 2)))],
    clip: "salat-sujud",
  },
  duduk: {
    title: "Duduk di antara dua sujud",
    kind: "rukun",
    instruction: textAt("9. Duduk di antara dua sujud", 0),
    notes: [TUMAKNINAH],
    recitations: [rec("duduk-antara-sujud", stripColon(textAt("9. Duduk di antara dua sujud", 1)))],
    clip: "salat-duduk",
  },
  "sujud-2": {
    title: "Sujud kedua",
    kind: "rukun",
    instruction: textAt("10. Sujud kedua", 0).replace(/\s*Baca:$/, ""),
    notes: [SUJUD_NOTE, TUMAKNINAH],
    recitations: [rec("sujud")],
    clip: "salat-sujud-kedua",
  },
  "berdiri-kedua": {
    title: "Berdiri untuk rakaat kedua",
    kind: "info",
    instruction: textAt("11. Berdiri untuk rakaat kedua", 0),
    notes: [],
    recitations: [],
    clip: "salat-berdiri",
  },
  "berdiri-ketiga": {
    title: "Berdiri untuk rakaat ketiga",
    kind: "info",
    instruction: findItem(sec31, "Berdiri ke rakaat ketiga"),
    notes: [],
    recitations: [],
    clip: "salat-berdiri",
  },
  "berdiri-keempat": {
    title: "Berdiri untuk rakaat keempat",
    kind: "info",
    instruction: findItem(sec32, "Berdiri ke rakaat keempat"),
    notes: [],
    recitations: [],
    clip: "salat-berdiri",
  },
  "tasyahud-awal": {
    title: "Duduk tasyahud awal",
    kind: "sunah",
    instruction: findItem(sec31, "Duduk tasyahud awal"),
    notes: [
      findItem("5. Sunah dan Hal yang Perlu Diperhatikan", "Tasyahud awal"),
      // Catatan penghubung dari pengembang (bukan dari panduan), perlu dikonfirmasi peninjau:
      "Panduan sumber tidak merinci bacaan tasyahud awal secara terpisah. Di sini ditampilkan bacaan tasyahud.",
    ],
    recitations: [rec("tasyahud")],
    clip: "salat-tasyahud-awal",
  },
  "tasyahud-akhir": {
    title: "Duduk tasyahud akhir",
    kind: "rukun",
    instruction: textAt("18. Duduk tasyahud akhir", 0),
    notes: [],
    recitations: [rec("tasyahud", stripColon(textAt("18. Duduk tasyahud akhir", 1))), rec("selawat", stripColon(textAt("18. Duduk tasyahud akhir", 3)))],
    clip: "salat-tasyahud-akhir",
  },
  "salam-kanan": {
    title: "Salam ke kanan",
    kind: "rukun",
    instruction: textAt("19. Salam", 0),
    notes: [],
    recitations: [rec("salam")],
    clip: "salat-salam-kanan",
  },
  "salam-kiri": {
    title: "Salam ke kiri",
    kind: "info",
    instruction: textAt("19. Salam", 2),
    notes: [],
    recitations: [rec("salam")],
    clip: "salat-salam-kiri",
  },
};

// ---------- Salat lima waktu (tabel panduan) ----------

const PRAYER_BY_NAME: Record<string, PrayerId> = { subuh: "subuh", zuhur: "dzuhur", asar: "ashar", magrib: "maghrib", isya: "isya" };

const prayers: PrayerRakaat[] = (() => {
  const table = section("3. Salat Wajib Lima Waktu").blocks.find((b) => b.type === "table");
  if (!table || table.type !== "table") throw new Error("Tabel salat lima waktu tidak ditemukan");
  return table.rows.slice(1).map((row) => {
    const [name, count, note] = row as [string, string, string];
    const prayer = PRAYER_BY_NAME[name.toLowerCase()];
    if (!prayer) throw new Error(`Nama salat tidak dikenal di tabel: ${name}`);
    return { prayer, name, rakaat: Number.parseInt(count, 10), note };
  });
})();

const disclaimer = (() => {
  const note = section("Materi Ibadah untuk Game Dunia Qinaraya").blocks.find((b) => b.type === "note");
  if (!note || note.type !== "note") throw new Error("Catatan pembuka tidak ditemukan");
  return note.text;
})();

const closingPrinciple = (() => {
  const block = section("Prinsip penyajian").blocks.find((b) => b.type === "list");
  const item = block && block.type === "list" ? block.items.find((i) => i.startsWith("Jadikan materi ini")) : undefined;
  if (!item) throw new Error("Prinsip penutup tidak ditemukan");
  return item;
})();

const sec32Block = section(sec32).blocks.filter((b) => b.type === "text");
const fatihahOnly = (() => {
  const t = sec32Block.find((b) => b.type === "text" && b.text.includes("rakaat ketiga dan keempat"));
  if (!t || t.type !== "text") throw new Error("Kalimat rakaat ketiga dan keempat tidak ditemukan");
  return t.text;
})();

export function buildWorshipGuide(): WorshipGuide {
  return {
    disclaimer,
    closingPrinciple,
    recitations: R,
    wuduSteps,
    movements,
    prayers,
    phrases: {
      tumakninah: TUMAKNINAH,
      standToThird: movements["berdiri-ketiga"]!.instruction,
      standToFourth: movements["berdiri-keempat"]!.instruction,
      standToSecond: movements["berdiri-kedua"]!.instruction,
      fatihahOnly,
      tasyahudAwalSit: movements["tasyahud-awal"]!.instruction,
      tasyahudAwalSunah: findItem("5. Sunah dan Hal yang Perlu Diperhatikan", "Tasyahud awal"),
      sujudRepeat: SUJUD_NOTE,
      prayerDone: textAt("19. Salam", 3),
    },
  };
}
