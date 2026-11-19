import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { buildWorshipGuide } from "../src/data/unreviewed/ibadahGuide.ts";
import { GUIDE_SECTIONS, GUIDE_SOURCE_SHA256 } from "../src/data/unreviewed/ibadahGuide.generated.ts";
import { buildSalatSteps, buildWuduSteps, describeIndicator, prayerRakaat } from "../src/systems/worship/sequences.ts";

const source = readFileSync(new URL("../docs/source/panduan_wudhu_dan_salat_dunia_qinaraya.md", import.meta.url), "utf8");
const guide = buildWorshipGuide();
const PRAYERS = ["subuh", "dzuhur", "ashar", "maghrib", "isya"] as const;

/** Sumber tanpa penanda Markdown, untuk memeriksa bahwa sebuah kalimat memang berasal dari panduan. */
const plainSource = source.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\r/g, "");

// ---------- Fidelitas terhadap panduan sumber ----------

test("data hasil ekstraksi selalu sinkron dengan berkas sumber (jalankan npm run guide:import bila gagal)", () => {
  assert.equal(GUIDE_SOURCE_SHA256, createHash("sha256").update(source).digest("hex"));
});

test("setiap baris Arab pada sumber ada di data, persis sama, dan sebaliknya", () => {
  const lines = source.replace(/\r/g, "").split("\n");
  const arabInSource: string[] = [];
  lines.forEach((line, i) => {
    if (/^\*\*Arab:\*\*$/.test(line.trim())) arabInSource.push(lines[i + 1]!.trim());
    if (/^\*\*Taawuz:\*\*$/.test(line.trim())) arabInSource.push(lines[i + 2]!.trim());
  });
  const arabInData = Object.values(guide.recitations).flatMap((r) => (r.arab ? [r.arab] : []));
  assert.equal(arabInSource.length, 15, "panduan memuat 15 teks Arab");
  assert.deepEqual([...arabInData].sort(), [...arabInSource].sort());
  for (const arab of arabInData) assert.ok(source.includes(arab), "teks Arab tidak ada di sumber");
});

test("transliterasi dan arti tiap bacaan ada di sumber tanpa perubahan", () => {
  assert.equal(Object.keys(guide.recitations).length, 16);
  for (const r of Object.values(guide.recitations)) {
    assert.ok(plainSource.includes(r.translit), `transliterasi ${r.id}`);
    assert.ok(plainSource.includes(r.arti), `arti ${r.id}`);
    assert.ok(r.translit.length > 5 && r.arti.length > 5);
  }
});

test("teks Arab tidak mengandung penanda Markdown atau karakter asing", () => {
  for (const r of Object.values(guide.recitations)) {
    if (!r.arab) continue;
    assert.ok(/[\u0600-\u06FF]/.test(r.arab), r.id);
    assert.ok(!/[*_#<>`]/.test(r.arab), `${r.id}: ada penanda Markdown`);
    assert.ok(/[\u064B-\u0652]/.test(r.arab), `${r.id}: harakat hilang`);
  }
});

test("niat salat hanya punya transliterasi (panduan tidak memberi teks Arab untuk niat Subuh)", () => {
  assert.equal(guide.recitations["niat-subuh"]!.arab, undefined);
  assert.match(guide.recitations["niat-subuh"]!.translit, /Ushallii fardhash-shubhi/);
});

test("semua kalimat petunjuk dan catatan berasal dari panduan, kecuali catatan penghubung yang diizinkan", () => {
  const ALLOWED_OWN = [
    "Teks Al-Fatihah tidak disertakan di panduan sumber. Bacalah dari mushaf atau dengan bimbingan guru.",
    "Teks surah pendek tidak disertakan di panduan sumber. Bacalah dari mushaf atau dengan bimbingan guru.",
    "Panduan sumber tidak merinci bacaan tasyahud awal secara terpisah. Di sini ditampilkan bacaan tasyahud.",
    // Dua potongan mekanis dari satu kalimat panduan; keabsahannya diuji khusus pada test "pemotongan kalimat".
    "Baca Surah Al-Fatihah.",
    "Disunahkan membaca surah atau ayat Al-Qur'an.",
  ];
  const check = (text: string, where: string) => {
    for (const piece of text.split("\n").map((l) => l.replace(/^• /, "").trim()).filter(Boolean)) {
      assert.ok(plainSource.includes(piece) || ALLOWED_OWN.includes(piece), `${where}: kalimat bukan dari panduan: "${piece}"`);
    }
  };
  guide.wuduSteps.forEach((m, i) => {
    check(m.instruction, `wudu ${i + 1}`);
    m.notes.forEach((n) => check(n, `wudu ${i + 1} catatan`));
    m.recitations.forEach((r) => r.lead && check(r.lead, `wudu ${i + 1} lead`));
  });
  for (const [id, m] of Object.entries(guide.movements)) {
    // Lafal niat non-Subuh dan kalimat yang dipotong dari panduan diperiksa terpisah di bawah.
    check(m.instruction, id);
    m.notes.forEach((n) => check(n, `${id} catatan`));
    m.recitations.forEach((r) => r.lead && check(r.lead, `${id} lead`));
    if (m.missingText) assert.ok(ALLOWED_OWN.includes(m.missingText), `${id}: missingText di luar daftar`);
  }
});

test("pemotongan kalimat Al-Fatihah dan surah mengikuti panduan", () => {
  assert.equal(guide.movements["fatihah-lanjut"]!.instruction, "Baca Surah Al-Fatihah.");
  assert.equal(guide.movements["surah-lanjut"]!.instruction, "Disunahkan membaca surah atau ayat Al-Qur'an.");
  assert.ok(plainSource.includes("Baca Surah Al-Fatihah, kemudian disunahkan membaca surah atau ayat Al-Qur'an."));
});

test("catatan pembuka dan prinsip penutup diambil dari panduan", () => {
  assert.match(guide.disclaimer, /mazhab Syafi'i/);
  assert.equal(guide.closingPrinciple, "Jadikan materi ini sebagai panduan belajar, bukan pengganti bimbingan guru agama.");
});

// ---------- Wudu ----------

test("wudu: 11 langkah sesuai urutan panduan dengan judul dari panduan", () => {
  const steps = buildWuduSteps(guide);
  assert.equal(steps.length, 11);
  const titles = GUIDE_SECTIONS.filter((s) => s.level === 3 && /^\d+\. /.test(s.title)).slice(0, 11).map((s) => s.title.replace(/^\d+\. /, ""));
  const expected = ["Niat", "Membaca basmalah", "Membasuh kedua telapak tangan", "Berkumur-kumur", "Membersihkan hidung", "Membasuh wajah", "Membasuh kedua tangan sampai siku", "Mengusap sebagian kepala", "Mengusap kedua telinga", "Membasuh kedua kaki sampai mata kaki", "Membaca doa setelah wudhu"];
  assert.deepEqual(titles, expected);
  steps.forEach((s, i) => {
    assert.equal(s.title.toLowerCase().replace("wudhu", "wudu"), expected[i]!.toLowerCase().replace("wudhu", "wudu"));
    assert.ok(s.clip.startsWith("wudu-"));
  });
});

test("wudu: rukun dan sunah dibedakan, dan sunah tidak ditampilkan sebagai rukun", () => {
  const steps = buildWuduSteps(guide);
  const rukun = steps.filter((s) => s.kind === "rukun").map((s) => s.title);
  assert.deepEqual(rukun, ["Niat", "Membasuh wajah", "Membasuh kedua tangan sampai siku", "Mengusap sebagian kepala", "Membasuh kedua kaki sampai mata kaki"]);
  // Panduan menyebut basmalah, berkumur, hidung, telinga, dan doa sebagai sunah.
  for (const t of ["Membaca basmalah", "Berkumur-kumur", "Membersihkan hidung", "Mengusap kedua telinga", "Membaca doa setelah wudu"]) {
    assert.equal(steps.find((s) => s.title === t)!.kind, "sunah", t);
  }
  const rukunList = GUIDE_SECTIONS.find((s) => s.title === "1.4 Rukun wudhu")!.blocks.find((b) => b.type === "list");
  assert.equal(rukunList && rukunList.type === "list" ? rukunList.items.length : 0, 6, "panduan menyebut enam rukun (yang keenam, tertib, bukan langkah tersendiri)");
});

test("wudu: bacaan hanya pada langkah yang memilikinya", () => {
  const steps = buildWuduSteps(guide);
  assert.deepEqual(steps.map((s) => s.recitations.length), [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2]);
  assert.equal(steps[0]!.recitations[0]!.lead, "Lafal niat yang lazim diajarkan");
  assert.match(steps[0]!.notes[0]!, /Melafalkannya bukan syarat sah wudhu/);
});

// ---------- Salat ----------

test("jumlah rakaat tiap salat mengikuti tabel panduan", () => {
  const expected = { subuh: 2, dzuhur: 4, ashar: 4, maghrib: 3, isya: 4 } as const;
  for (const p of PRAYERS) assert.equal(prayerRakaat(p, guide), expected[p], p);
  assert.deepEqual(guide.prayers.map((p) => p.name), ["Subuh", "Zuhur", "Asar", "Magrib", "Isya"]);
});

test("urutan salat: jumlah langkah dan struktur per rakaat", () => {
  const lens = { subuh: 22, dzuhur: 37, ashar: 37, maghrib: 30, isya: 37 } as const;
  for (const p of PRAYERS) {
    const steps = buildSalatSteps(p, guide);
    const total = prayerRakaat(p, guide);
    assert.equal(steps.length, lens[p], p);
    const count = (key: string) => steps.filter((s) => s.id.endsWith(`-${key}`)).length;
    assert.equal(count("niat"), 1);
    assert.equal(count("takbir"), 1);
    assert.equal(count("iftitah"), 1, "iftitah hanya rakaat pertama");
    assert.equal(count("taawuz"), 1);
    assert.equal(count("rukuk"), total, "satu rukuk per rakaat");
    assert.equal(count("iktidal"), total);
    assert.equal(count("sujud-1"), total);
    assert.equal(count("sujud-2"), total, "dua sujud per rakaat");
    assert.equal(count("duduk"), total);
    assert.equal(count("fatihah"), total, "Al-Fatihah di setiap rakaat");
    assert.equal(count("surah"), 2, "surah hanya pada dua rakaat pertama");
    assert.equal(count("tasyahud-awal"), total === 2 ? 0 : 1);
    assert.equal(count("tasyahud-akhir"), 1);
    assert.equal(count("salam-kanan"), 1);
    assert.equal(count("salam-kiri"), 1);
    assert.equal(count("berdiri"), total - 1);
  }
});

test("urutan salat: tiap rakaat berurutan rukuk, iktidal, sujud, duduk, sujud; penutup benar", () => {
  for (const p of PRAYERS) {
    const steps = buildSalatSteps(p, guide);
    const total = prayerRakaat(p, guide);
    for (let r = 1; r <= total; r++) {
      const keys = steps.filter((s) => s.indicator!.rakaat === r).map((s) => s.id.replace(`r${r}-`, ""));
      const tail = keys.filter((k) => ["rukuk", "iktidal", "sujud-1", "duduk", "sujud-2"].includes(k));
      assert.deepEqual(tail, ["rukuk", "iktidal", "sujud-1", "duduk", "sujud-2"], `${p} rakaat ${r}`);
      assert.ok(keys.indexOf("fatihah") < keys.indexOf("rukuk"));
    }
    const ids = steps.map((s) => s.id);
    const lastSujud = ids.lastIndexOf(`r${total}-sujud-2`);
    assert.deepEqual(ids.slice(lastSujud + 1), [`r${total}-tasyahud-akhir`, `r${total}-salam-kanan`, `r${total}-salam-kiri`]);
    if (total > 2) {
      const awal = ids.indexOf("r2-tasyahud-awal");
      assert.ok(awal > ids.indexOf("r2-sujud-2") && awal < ids.indexOf("r3-berdiri"), "tasyahud awal setelah rakaat kedua");
    }
  }
});

test("indikator rakaat konsisten dan terbaca", () => {
  const steps = buildSalatSteps("maghrib", guide);
  let previous = 0;
  for (const s of steps) {
    assert.equal(s.indicator!.totalRakaat, 3);
    assert.ok(s.indicator!.rakaat >= previous);
    previous = s.indicator!.rakaat;
  }
  assert.equal(describeIndicator(steps[0]!), "Rakaat 1 dari 3: Berdiri dan niat");
  assert.equal(describeIndicator(steps.find((s) => s.id === "r2-sujud-1")!), "Rakaat 2 dari 3: Sujud pertama");
  assert.equal(describeIndicator(buildWuduSteps(guide)[0]!), null);
});

test("salat: sunah tidak pernah diberi label rukun, dan rukun utama berlabel rukun", () => {
  const steps = buildSalatSteps("dzuhur", guide);
  const kindOf = (suffix: string) => [...new Set(steps.filter((s) => s.id.endsWith(suffix)).map((s) => s.kind))];
  assert.deepEqual(kindOf("-iftitah"), ["sunah"]);
  assert.deepEqual(kindOf("-taawuz"), ["sunah"]);
  assert.deepEqual(kindOf("-surah"), ["sunah"]);
  assert.deepEqual(kindOf("-tasyahud-awal"), ["sunah"]);
  for (const k of ["-niat", "-takbir", "-fatihah", "-rukuk", "-iktidal", "-sujud-1", "-sujud-2", "-duduk", "-tasyahud-akhir", "-salam-kanan"]) assert.deepEqual(kindOf(k), ["rukun"], k);
  assert.deepEqual(kindOf("-salam-kiri"), ["info"], "panduan tidak memberi label pada salam kedua");
  assert.deepEqual(kindOf("-berdiri"), ["info"]);
});

test("niat salat: lafal contoh hanya untuk Subuh; salat lain tidak diberi lafal karangan", () => {
  const subuh = buildSalatSteps("subuh", guide)[0]!;
  assert.equal(subuh.recitations[0]!.recitation.id, "niat-subuh");
  assert.match(subuh.instruction, /Contoh niat salat Subuh/);
  for (const p of ["dzuhur", "ashar", "maghrib", "isya"] as const) {
    const first = buildSalatSteps(p, guide)[0]!;
    assert.equal(first.recitations.length, 0, p);
    assert.doesNotMatch(first.instruction, /Contoh niat salat Subuh/, p);
    assert.ok(first.notes.some((n) => n.includes("tidak tercantum di panduan sumber")), p);
    assert.ok(first.notes.some((n) => n.includes("Niat di dalam hati adalah yang wajib")), "catatan panduan tetap ada");
  }
});

test("Al-Fatihah dan surah: teks tidak ada di panduan, jadi tidak dikarang dan pengguna diberi tahu", () => {
  for (const s of buildSalatSteps("subuh", guide).filter((x) => /-(fatihah|surah)$/.test(x.id))) {
    assert.equal(s.recitations.length, 0, `${s.id}: tidak boleh ada bacaan karangan`);
    assert.match(s.missingText!, /tidak disertakan di panduan sumber/);
  }
});

test("tumakninah diingatkan pada rukuk, iktidal, sujud, dan duduk di antara dua sujud", () => {
  for (const s of buildSalatSteps("subuh", guide).filter((x) => /-(rukuk|iktidal|sujud-1|sujud-2|duduk)$/.test(x.id))) {
    assert.ok(s.notes.some((n) => n.startsWith("Tumakninah")), s.id);
  }
});

test("tasyahud awal menampilkan tasyahud saja, tasyahud akhir menambah selawat", () => {
  const steps = buildSalatSteps("dzuhur", guide);
  assert.deepEqual(steps.find((s) => s.id === "r2-tasyahud-awal")!.recitations.map((r) => r.recitation.id), ["tasyahud"]);
  assert.deepEqual(steps.find((s) => s.id === "r4-tasyahud-akhir")!.recitations.map((r) => r.recitation.id), ["tasyahud", "selawat"]);
  assert.ok(steps.find((s) => s.id === "r2-tasyahud-awal")!.notes.some((n) => n.includes("sunah ab'ad")));
});

test("pola rakaat 3 dan 4: Al-Fatihah saja, dan kalimat penutup menyebut jumlah rakaat yang benar", () => {
  const dz = buildSalatSteps("dzuhur", guide);
  assert.ok(dz.find((s) => s.id === "r3-fatihah")!.notes[0]!.includes("Al-Fatihah saja sudah mencukupi"));
  assert.ok(dz.find((s) => s.id === "r3-berdiri")!.instruction.includes("rakaat ketiga"));
  assert.ok(dz.find((s) => s.id === "r4-berdiri")!.instruction.includes("rakaat keempat"));
  assert.equal(dz[dz.length - 1]!.notes[0], "Salat empat rakaat selesai.");
  const mg = buildSalatSteps("maghrib", guide);
  assert.equal(mg[mg.length - 1]!.notes[0], "Salat tiga rakaat selesai.");
  const sb = buildSalatSteps("subuh", guide);
  assert.equal(sb[sb.length - 1]!.notes[0], "Salat dua rakaat selesai.");
});

test("id langkah unik dalam satu urutan", () => {
  for (const p of PRAYERS) {
    const ids = buildSalatSteps(p, guide).map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, p);
  }
  const wudu = buildWuduSteps(guide).map((s) => s.id);
  assert.equal(new Set(wudu).size, wudu.length);
});
