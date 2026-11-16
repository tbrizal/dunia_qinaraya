import { writeFileSync } from "node:fs";
import { ACTIVITIES } from "../src/data/activities.ts";
import { DIALOGUES } from "../src/data/dialogues.ts";
import { LEARNING_CONTENT } from "../src/data/learning.ts";
import { PLACES } from "../src/data/places.ts";
import { QUEST_LIST } from "../src/data/quests.ts";
import { registerUnreviewedContent } from "../src/data/unreviewed/index.ts";
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

out("## Aktivitas terpandu (wudu dan salat)");
out();
out("Berkas: `src/data/unreviewed/activities.ts`. Aktivitas ini sengaja hanya berupa teks langkah demi langkah:");
out("**tidak ada animasi gerakan wudu atau salat**, tidak ada skor, hadiah, atau pencatatan, dan tidak ada penalti bila tidak dilakukan.");
out("Peninjau juga diminta memutuskan apakah animasi gerakan boleh dibuat, dan bila ya, memberikan urutan yang disetujui.");
out();
for (const a of ACTIVITIES) {
  out(`### ${a.title} (\`${a.id}\`)`);
  out();
  out(`- Status saat ini: **${reviewLabel(a.reviewStatus)}** (\`${a.reviewStatus}\`)`);
  out(`- Lokasi: ${a.placeId}, ketersediaan: ${a.availability === "prayer-window" ? "hanya saat waktu salat sedang berlangsung" : "kapan saja"}`);
  out(`- Catatan untuk peninjau: ${a.reviewNotes}`);
  out();
  a.steps.forEach((step, i) => out(`${i + 1}. **${step.title}**: ${step.text}`));
  out();
  out(`- Penutup: ${a.closing}`);
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
