import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { build } from "vite";

/**
 * Membangun aplikasi sungguhan dan memeriksa isi bundle. Ini bukti bahwa konten agama yang belum
 * ditinjau benar-benar tidak terkirim ke pemain pada build produksi, bukan sekadar disembunyikan di UI.
 */

const DRAFT_SENTINELS = ["Wudu adalah cara bersuci", "Berkenalan dengan Masjid", "Umat Islam melaksanakan salat lima waktu", "Berbagi Hasil Kebun", "Latihan Berwudu", "Salat dilakukan di dunia nyata", "Kamu bisa berwudu dan salat di masjid"];
const DEV_SENTINEL = "Panel debug (hanya development)";

async function buildAndRead(env: Record<string, string | undefined>): Promise<string> {
  const outDir = mkdtempSync(join(tmpdir(), "qinaraya-build-"));
  const saved: Record<string, string | undefined> = {};
  for (const key of Object.keys(env)) saved[key] = process.env[key];
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    await build({ mode: "production", logLevel: "silent", build: { outDir, emptyOutDir: true, write: true } });
    const dir = join(outDir, "assets");
    return readdirSync(dir)
      .filter((f) => f.endsWith(".js"))
      .map((f) => readFileSync(join(dir, f), "utf8"))
      .join("\n");
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    rmSync(outDir, { recursive: true, force: true });
  }
}

test("build produksi standar: tidak ada teks materi draf dan tidak ada panel debug", async () => {
  const js = await buildAndRead({ VITE_SHOW_UNREVIEWED_CONTENT: undefined, VERCEL_ENV: undefined });
  for (const text of DRAFT_SENTINELS) assert.ok(!js.includes(text), `teks draf bocor di bundle produksi: "${text}"`);
  assert.ok(!js.includes(DEV_SENTINEL), "panel debug ikut terbundel");
  assert.ok(js.includes("Selamat {timeOfDay}. Aku sedang menyiapkan bahan cerita"), "dialog cadangan non-agama harus ada");
});

test("deploy Production di Vercel menolak saklar konten belum ditinjau", async () => {
  const js = await buildAndRead({ VITE_SHOW_UNREVIEWED_CONTENT: "true", VERCEL_ENV: "production" });
  for (const text of DRAFT_SENTINELS) assert.ok(!js.includes(text), `bocor di Production: "${text}"`);
});

test("build uji (staging/preview) dengan saklar menyala memuat konten draf", async () => {
  const js = await buildAndRead({ VITE_SHOW_UNREVIEWED_CONTENT: "true", VERCEL_ENV: "preview" });
  assert.ok(js.includes(DRAFT_SENTINELS[0]!), "build uji seharusnya memuat materi draf");
  assert.ok(!js.includes(DEV_SENTINEL), "panel debug tetap tidak ada di build non-development");
});
