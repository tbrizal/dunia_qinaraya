import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import type { GuideBlock, GuideSection } from "../src/data/worship.ts";

/**
 * Mengekstrak panduan wudu dan salat (Markdown) menjadi data game TANPA mengetik ulang apa pun,
 * terutama teks Arab. Hasil: src/data/unreviewed/ibadahGuide.generated.ts.
 * Jalankan: npm run guide:import. Test memverifikasi hasilnya sama persis dengan sumber.
 */

const SOURCE = new URL("../docs/source/panduan_wudhu_dan_salat_dunia_qinaraya.md", import.meta.url);
const OUTPUT = new URL("../src/data/unreviewed/ibadahGuide.generated.ts", import.meta.url);

const raw = readFileSync(SOURCE, "utf8");
const lines = raw.replace(/\r\n/g, "\n").split("\n");

/** Menghapus penanda tebal dan miring Markdown dari teks biasa; isi tidak diubah. */
function plain(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/(^|[^*])\*([^*\n]+)\*/g, "$1$2").trim();
}

function unquote(text: string): string {
  return text.trim().replace(/^[“"]/, "").replace(/[”"]$/, "").trim();
}

function italic(text: string): string {
  return text.trim().replace(/^\*/, "").replace(/\*$/, "").trim();
}

function parseBody(body: string[]): GuideBlock[] {
  const paragraphs: string[][] = [];
  let current: string[] = [];
  for (const line of body) {
    if (line.trim() === "" || line.trim() === "---") {
      if (current.length) paragraphs.push(current);
      current = [];
    } else current.push(line.trim());
  }
  if (current.length) paragraphs.push(current);

  const blocks: GuideBlock[] = [];
  let pending: { label?: string; arab?: string; translit?: string } | null = null;
  let taawuz: string[] | null = null;

  const flush = (arti: string) => {
    if (!pending || pending.translit === undefined) throw new Error("Blok bacaan tidak lengkap sebelum: " + arti);
    blocks.push({
      type: "recitation",
      ...(pending.label ? { label: pending.label } : {}),
      ...(pending.arab ? { arab: pending.arab } : {}),
      translit: pending.translit,
      arti,
    });
    pending = null;
  };

  for (const p of paragraphs) {
    const first = p[0]!;

    if (taawuz) {
      taawuz.push(p.join(" "));
      if (taawuz.length === 3) {
        blocks.push({ type: "recitation", label: "Taawuz", arab: taawuz[0]!, translit: italic(taawuz[1]!), arti: unquote(taawuz[2]!) });
        taawuz = null;
      }
      continue;
    }
    if (/^\*\*Taawuz:\*\*$/.test(first)) {
      taawuz = [];
      continue;
    }
    if (/^\*\*Arab:\*\*$/.test(first)) {
      pending = { arab: p.slice(1).join(" ") };
      continue;
    }
    if (/^\*\*Transliterasi[^*]*:\*\*$/.test(first)) {
      pending ??= {};
      pending.translit = italic(p.slice(1).join(" "));
      continue;
    }
    if (/^\*\*Arti:\*\*$/.test(first)) {
      flush(unquote(p.slice(1).join(" ")));
      continue;
    }

    if (p.every((l) => l.startsWith("|"))) {
      const rows = p.filter((l) => !/^\|[\s:|-]+\|$/.test(l)).map((l) => l.split("|").slice(1, -1).map((c) => plain(c)));
      blocks.push({ type: "table", rows });
    } else if (p.every((l) => /^[-*] /.test(l))) {
      blocks.push({ type: "list", ordered: false, items: p.map((l) => plain(l.replace(/^[-*] /, ""))) });
    } else if (p.every((l) => /^\d+\. /.test(l))) {
      blocks.push({ type: "list", ordered: true, items: p.map((l) => plain(l.replace(/^\d+\. /, ""))) });
    } else if (p.every((l) => l.startsWith(">"))) {
      blocks.push({ type: "note", text: plain(p.map((l) => l.replace(/^>\s?/, "")).join(" ")) });
    } else if (p.length === 1 && /^\*[^*].*\*$/.test(first)) {
      blocks.push({ type: "translit", text: italic(first) });
    } else {
      // Paragraf yang berisi butir bernomor atau berstrip (diselingi baris tautan) dipertahankan per baris.
      const structured = p.length > 1 && p.some((l) => /^(\d+\.|[-*]) /.test(l));
      blocks.push({ type: "text", text: structured ? p.map((l) => plain(l)).join("\n") : plain(p.join(" ")) });
    }
  }
  if (pending || taawuz) throw new Error("Blok bacaan menggantung di akhir bagian");
  return blocks;
}

const sections: GuideSection[] = [];
let title = "";
let level = 0;
let body: string[] = [];
const push = () => {
  if (level > 0) sections.push({ level, title, blocks: parseBody(body) });
  body = [];
};
for (const line of lines) {
  const m = /^(#{1,4}) (.+)$/.exec(line);
  if (m) {
    push();
    level = m[1]!.length;
    title = m[2]!.trim();
  } else body.push(line);
}
push();

const sha = createHash("sha256").update(raw).digest("hex");
const recitations = sections.reduce((n, s) => n + s.blocks.filter((b) => b.type === "recitation").length, 0);

writeFileSync(
  OUTPUT,
  `import type { GuideSection } from "../worship.ts";

/**
 * DIHASILKAN OTOMATIS oleh scripts/import-ibadah-guide.ts dari docs/source/panduan_wudhu_dan_salat_dunia_qinaraya.md.
 * Jangan diedit manual: ubah sumbernya lalu jalankan \`npm run guide:import\`.
 * Konten ini BELUM DITINJAU dan tidak ikut build produksi.
 */
export const GUIDE_SOURCE_SHA256 = ${JSON.stringify(sha)};

export const GUIDE_SECTIONS: readonly GuideSection[] = ${JSON.stringify(sections, null, 2)};
`,
);
console.log(`Diekstrak: ${sections.length} bagian, ${recitations} bacaan. SHA-256 sumber: ${sha.slice(0, 12)}...`);
