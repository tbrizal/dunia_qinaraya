import { writeFileSync } from "node:fs";
import { ACTIVITIES } from "../src/data/activities.ts";
import { DIALOGUES } from "../src/data/dialogues.ts";
import { LEARNING_CONTENT } from "../src/data/learning.ts";
import { PLACES } from "../src/data/places.ts";
import { QUEST_LIST } from "../src/data/quests.ts";
import { registerUnreviewedContent } from "../src/data/unreviewed/index.ts";
import { GUIDE_SOURCE_SHA256 } from "../src/data/unreviewed/ibadahGuide.generated.ts";
import { getWorshipGuide } from "../src/data/worship.ts";
import { buildSalatSteps, buildWuduSteps } from "../src/systems/worship/sequences.ts";
import { reviewLabel } from "../src/systems/content/review.ts";

/**
 * Menghasilkan docs/CONTENT_REVIEW.md dari data asli, sehingga dokumen untuk reviewer
 * tidak pernah berbeda dari yang ada di game. Jalankan: npm run content:review
 */

registerUnreviewedContent();

const lines: string[] = [];
const out = (s = "") => lines.push(s);

out("# Daftar Konten untuk Peninjauan");
out();
out("Dokumen ini dibuat otomatis oleh `npm run content:review`. Jangan diedit manual; ubah data lalu jalankan ulang.");
out();
out("Semua konten di bawah berstatus **belum ditinjau** dan **tidak tampil di build produksi**.");
out("Konten ditulis tanpa kutipan ayat atau hadis. Kolom persetujuan diisi oleh peninjau yang kompeten, bukan oleh pengembang.");
out();
out("## Cara menyetujui");
out();
out("1. Peninjau membaca setiap materi dan memberi catatan atau koreksi.");
out("2. Pengembang menerapkan koreksi pada berkas data yang disebut di bawah.");
out("3. Setelah disetujui, pindahkan entri dari `src/data/unreviewed/` ke berkas data utama di `src/data/`,");
out("   ubah `reviewStatus` menjadi `approved`, dan isi `reviewedBy` serta `reviewedAt`.");
out("4. Jalankan `npm test` lalu `npm run content:review`. Test menolak status `approved` tanpa peninjau.");
out();

out("## Teks sistem di luar daftar materi (bukan materi agama, tetap mohon diperiksa)");
out();
out("- Panel jam: \"Kalender dan jadwal ini adalah simulasi buatan game, bukan penetapan tanggal atau waktu ibadah yang sebenarnya. Untuk waktu salat yang sebenarnya, ikuti jadwal dari masjid atau lembaga di daerahmu. Tidak ada hukuman jika kamu tidak mengikuti pengingat.\" (`src/components/ui/TimePanel.tsx`)");
out("- Pengingat: \"Waktu [nama waktu] telah tiba di Qinaraya\" dan \"Jadwal simulasi. Santai saja, tidak perlu terburu-buru.\" (`PrayerNotice.tsx`, `persistence.ts`)");
out("- Pengaturan: \"Pengingat hanya membantu mengenal waktu. Tidak ada hukuman bila diabaikan.\" (`SettingsPanel.tsx`)");
out("- Jadwal simulasi lima waktu dan nama bulan Hijriah: `src/config/lifestyleConfig.ts`, `src/systems/calendar/hijriCalendar.ts`. Jam salat adalah keputusan desain game, bukan perhitungan astronomis.");
out();

out("## Materi edukasi");
out();
for (const c of LEARNING_CONTENT) {
  out(`### ${c.title} (\`${c.id}\`)`);
  out();
  out(`- Status saat ini: **${reviewLabel(c.reviewStatus)}** (\`${c.reviewStatus}\`)`);
  out(`- Kategori: ${c.category}, tingkat usia: ${c.ageLevel}`);
  out(`- Berkas: \`src/data/unreviewed/learning.ts\``);
  out(`- Catatan untuk peninjau: ${c.reviewNotes}`);
  out();
  c.pages.forEach((page, i) => out(`${i + 1}. ${page}`));
  out();
  out("- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________");
  out("- Catatan peninjau: ");
  out();
}

out("## Panduan wudu dan salat (sumber dari pemilik proyek)");
out();
out("Sumber: `docs/source/panduan_wudhu_dan_salat_dunia_qinaraya.md` (SHA-256 " + GUIDE_SOURCE_SHA256.slice(0, 12) + "...).");
out("Seluruh kalimat petunjuk, bacaan Arab, transliterasi, dan arti diekstrak otomatis (`npm run guide:import`), tidak diketik ulang.");
out("Test membandingkan setiap baris Arab dengan sumber secara persis. Teks tambahan dari pengembang dibatasi pada judul, label, dan catatan penghubung yang daftarnya ada di `tests/worship-guide.test.ts`.");
out();
out("Berkas data: `src/data/unreviewed/ibadahGuide.ts` (pemetaan), `ibadahGuide.generated.ts` (hasil ekstraksi), `ibadahLearning.ts` (materi baca).");
out();
const guide = getWorshipGuide()!;
out("### Langkah wudu dalam game");
out();
buildWuduSteps(guide).forEach((st, i) => out(`${i + 1}. ${st.title} (${st.kind}) - animasi \`${st.clip}\``));
out();
out("### Urutan salat dalam game");
out();
for (const p of guide.prayers) {
  const steps = buildSalatSteps(p.prayer, guide);
  out(`- ${p.name}: ${p.rakaat} rakaat, ${steps.length} langkah`);
}
out();
out("### Keputusan implementasi yang perlu dikonfirmasi peninjau");
out();
out("Hal-hal berikut tidak disebut tegas di panduan sumber, sehingga implementasinya mengambil bentuk paling sederhana atau netral:");
out();
out("1. **Label sunah untuk 'membasuh telapak tangan'.** Panduan tidak memasukkannya ke enam rukun, tetapi juga tidak menyebutnya sunah. Ditampilkan sebagai sunah.");
out("2. **Label sunah untuk taawuz.** Tidak termasuk rukun salat; panduan tidak menyebutnya sunah secara eksplisit.");
out("3. **Bacaan tasyahud awal.** Panduan hanya merinci bacaan tasyahud pada tasyahud akhir. Pada tasyahud awal ditampilkan tasyahud tanpa selawat, disertai catatan bahwa panduan tidak merincinya.");
out("4. **Posisi duduk tasyahud awal.** Panduan tidak menyebutnya. Digambarkan iftirasy (seperti duduk di antara dua sujud).");
out("5. **Posisi tangan setelah iktidal.** Panduan tidak menyebutnya. Digambarkan diturunkan di sisi tubuh.");
out("6. **Salam kedua** diberi label netral (bukan rukun, bukan sunah), karena panduan hanya menyebut salam pertama sebagai rukun.");
out("7. **Niat salat selain Subuh.** Panduan hanya memberi lafal contoh untuk Subuh. Salat lain tidak diberi lafal; ditampilkan catatan bahwa niat di dalam hati yang wajib.");
out("8. **Al-Fatihah dan surah pendek.** Teks Arabnya tidak ada di panduan, jadi tidak ditampilkan; pemain diarahkan ke mushaf atau guru.");
out("9. **Qunut Subuh** tidak dimasukkan karena tidak ada di panduan.");
out("10. **Jari telunjuk saat tasyahud, posisi telapak tangan, dan arah pandangan.** Tidak dirinci panduan; animasi tidak menggambarkannya secara spesifik.");
out("11. **Tawarruk.** Karena kerangka karakter belum punya gerak menyamping pada pinggul, kaki kiri digambarkan terselip ke belakang di bawah paha, bukan melintas di bawah betis kanan.");
out("12. **Qibla.** Di dunia Qinaraya qibla ditetapkan ke arah utara sesuai desain masjid (pintu menghadap selatan). Ini pengaturan dunia fiktif.");
out("13. **Jumlah basuhan.** Animasi mengulang tiga kali sesuai yang disunahkan di panduan; satu kali basuhan merata sudah memenuhi rukun.");
out();
out("### Aktivitas dalam game");
out();
for (const a of ACTIVITIES) {
  out(`#### ${a.title} (\`${a.id}\`)`);
  out();
  out(`- Status saat ini: **${reviewLabel(a.reviewStatus)}** (\`${a.reviewStatus}\`)`);
  out(`- Lokasi: ${a.placeId}, ketersediaan: ${a.availability === "prayer-window" ? "salat sesungguhnya hanya saat waktu salat berlangsung; di luar itu tersedia sebagai latihan" : "kapan saja"}`);
  out(`- Catatan untuk peninjau: ${a.reviewNotes}`);
  out(`- Penutup (tambahan pengembang): ${a.closing}`);
  if (a.reminderHint) out(`- Kalimat pada pengingat waktu salat: ${a.reminderHint}`);
  out();
  out("- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________");
  out("- Catatan peninjau: ");
  out();
}

out("## Quest pembelajaran");
out();
for (const q of QUEST_LIST.filter((x) => x.category === "islamic-learning")) {
  out(`### ${q.title} (\`${q.id}\`)`);
  out();
  out(`- Status: **${reviewLabel(q.reviewStatus ?? "draft")}**, berkas: \`src/data/unreviewed/quests.ts\``);
  out(`- Ringkasan: ${q.summary}`);
  out(`- Prasyarat: ${q.requires?.join(", ") ?? "tidak ada"}`);
  out("- Tujuan:");
  for (const o of q.objectives) out(`  - ${o.label} (${o.count}x)`);
  out(`- Hadiah (kosmetik): ${q.rewardItems.map((r) => `${r.itemId} x${r.quantity}`).join(", ")}`);
  out();
  out("- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________");
  out();
}

out("## Dialog Ustadz Harun");
out();
out("Berkas: `src/data/unreviewed/ustadzDialogue.ts`. Dialog cadangan (non-agama) ada di `src/data/dialogues.ts` dan selalu tampil.");
out();
const harun = DIALOGUES["ustadz-harun"]!;
for (const [id, node] of Object.entries(harun.nodes)) {
  out(`- **${id}**: ${node.text}`);
  for (const choice of node.choices ?? []) out(`  - Pilihan: "${choice.label}"`);
}
out();
out("- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________");
out();

out("## Lokasi");
out();
for (const p of PLACES) out(`- ${p.name}: ${p.blurb} (materi: ${p.contentIds.join(", ") || "tidak ada"})`);
out();

writeFileSync(new URL("../docs/CONTENT_REVIEW.md", import.meta.url), lines.join("\n") + "\n");
console.log(`docs/CONTENT_REVIEW.md dibuat: ${LEARNING_CONTENT.length} materi, ${ACTIVITIES.length} aktivitas, ${QUEST_LIST.filter((q) => q.category === "islamic-learning").length} quest, ${Object.keys(harun.nodes).length} node dialog.`);
