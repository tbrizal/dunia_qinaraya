import type { MovementDef, PrayerId, WorshipGuide, WorshipStepView } from "../../data/worship.ts";

/**
 * Menyusun urutan langkah wudu dan salat (2, 3, atau 4 rakaat) dari panduan. Murni: tanpa DOM atau Three.js.
 * Urutan mengikuti pola 3.1 dan 3.2 di panduan: surah hanya pada dua rakaat pertama, tasyahud awal setelah
 * rakaat kedua pada salat 3 dan 4 rakaat, dan tasyahud akhir pada rakaat terakhir.
 */

const ORDINAL = ["", "pertama", "kedua", "ketiga", "keempat"];
const COUNT_WORD: Record<number, string> = { 2: "dua", 3: "tiga", 4: "empat" };

export function prayerRakaat(prayer: PrayerId, guide: WorshipGuide): number {
  const entry = guide.prayers.find((p) => p.prayer === prayer);
  if (!entry) throw new Error(`Salat tidak ada di panduan: ${prayer}`);
  return entry.rakaat;
}

export function prayerName(prayer: PrayerId, guide: WorshipGuide): string {
  return guide.prayers.find((p) => p.prayer === prayer)?.name ?? prayer;
}

function fromMovement(id: string, m: MovementDef): WorshipStepView {
  return {
    id,
    title: m.title,
    kind: m.kind,
    instruction: m.instruction,
    notes: [...m.notes],
    recitations: m.recitations,
    clip: m.clip,
    ...(m.missingText ? { missingText: m.missingText } : {}),
  };
}

export function buildWuduSteps(guide: WorshipGuide): WorshipStepView[] {
  return guide.wuduSteps.map((m, i) => fromMovement(`wudu-${i + 1}`, m));
}

export function buildSalatSteps(prayer: PrayerId, guide: WorshipGuide): WorshipStepView[] {
  const total = prayerRakaat(prayer, guide);
  if (![2, 3, 4].includes(total)) throw new Error(`Jumlah rakaat tidak didukung: ${total}`);
  const steps: WorshipStepView[] = [];

  const add = (rakaat: number, key: string, movement: MovementDef, overrides: Partial<WorshipStepView> = {}) => {
    const step = fromMovement(`r${rakaat}-${key}`, movement);
    step.indicator = { rakaat, totalRakaat: total, position: movement.title };
    Object.assign(step, overrides);
    steps.push(step);
  };
  const m = (id: string): MovementDef => {
    const def = guide.movements[id];
    if (!def) throw new Error(`Gerakan tidak ada di panduan: ${id}`);
    return def;
  };

  // Niat salat: lafal contoh di panduan hanya untuk Subuh. Salat lain tidak diberi lafal yang dikarang.
  const niat = m("niat");
  if (prayer === "subuh") add(1, "niat", niat, { recitations: [{ recitation: guide.recitations["niat-subuh"]! }] });
  else
    add(1, "niat", niat, {
      instruction: niat.instruction.replace(/\s*Contoh niat salat Subuh:$/, ""),
      notes: [...niat.notes, "Lafal niat untuk salat ini tidak tercantum di panduan sumber. Yang wajib adalah niat di dalam hati."],
    });

  const body = (rakaat: number, withSurah: boolean) => {
    add(rakaat, "rukuk", m("rukuk"));
    add(rakaat, "iktidal", m("iktidal"));
    add(rakaat, "sujud-1", m("sujud-1"));
    add(rakaat, "duduk", m("duduk"));
    add(rakaat, "sujud-2", m("sujud-2"));
    void withSurah;
  };

  for (let r = 1; r <= total; r++) {
    if (r === 1) {
      add(1, "takbir", m("takbir"));
      add(1, "iftitah", m("iftitah"));
      add(1, "taawuz", m("taawuz"));
      add(1, "fatihah", m("fatihah"));
      add(1, "surah", m("surah"));
    } else {
      const standId = r === 2 ? "berdiri-kedua" : r === 3 ? "berdiri-ketiga" : "berdiri-keempat";
      add(r, "berdiri", m(standId));
      add(r, "fatihah", m("fatihah-lanjut"), r >= 3 ? { notes: [guide.phrases.fatihahOnly] } : {});
      if (r <= 2) add(r, "surah", m("surah-lanjut"));
    }
    body(r, r <= 2);

    const isLast = r === total;
    if (!isLast && r === 2) add(r, "tasyahud-awal", m("tasyahud-awal"));
  }

  const last = total;
  add(last, "tasyahud-akhir", m("tasyahud-akhir"));
  add(last, "salam-kanan", m("salam-kanan"));
  add(last, "salam-kiri", m("salam-kiri"), {
    notes: [guide.phrases.prayerDone.replace("dua rakaat", `${COUNT_WORD[total]} rakaat`)],
  });
  return steps;
}

/** Teks ringkas posisi untuk indikator, mis. "Rakaat 2 dari 4: Sujud pertama". */
export function describeIndicator(step: WorshipStepView): string | null {
  if (!step.indicator) return null;
  const { rakaat, totalRakaat, position } = step.indicator;
  return `Rakaat ${rakaat} dari ${totalRakaat}: ${position}`;
}

export { ORDINAL };
