import { getCropDef } from "../../data/crops.ts";
import { getItemDef } from "../../data/items.ts";
import { LEARNING_CONTENT } from "../../data/learning.ts";
import { getQuestDef, QUEST_LIST } from "../../data/quests.ts";
import { PLOT_STATUSES, createPlot } from "../farming/farmPlot.ts";
import type { FarmPlot, PlotStatus } from "../farming/farmPlot.ts";
import type { InventoryState, ItemStack } from "../inventory/inventory.ts";
import { QUEST_STATUSES } from "../quest/questEngine.ts";
import type { QuestProgress, QuestState, QuestStatus } from "../quest/questEngine.ts";
import { fromTotalMinutes, toTotalMinutes } from "../time/gameClock.ts";
import type { ClockConfig, GameClockState } from "../time/gameClock.ts";

/**
 * Format save lokal dan validasinya. Murni (tanpa localStorage) agar bisa dites.
 * Setiap perubahan struktur menaikkan SAVE_VERSION dan menambah fungsi di `migrations`.
 */

export const SAVE_VERSION = 2;

export interface SaveData {
  version: number;
  savedAt: number;
  profile: { name: string };
  player: { x: number; z: number; heading: number };
  clock: { state: Omit<GameClockState, "isPaused">; accumulator: number };
  inventory: InventoryState;
  farm: { plots: FarmPlot[] };
  quests: SavedQuests;
  /** Id materi edukasi yang sudah selesai dibaca. Hanya catatan belajar, bukan skor. */
  learning: { learned: string[] };
  settings: { cameraSensitivity: number; showFps: boolean; prayerNotifications: boolean; prayerSound: boolean };
}

/** Progres quest yang disimpan. `objectiveIds` mencatat urutan objektif saat disimpan. */
export type SavedQuests = Record<string, QuestProgress & { objectiveIds?: string[] }>;

/** Menambahkan id objektif ke setiap quest sebelum disimpan, supaya progres tahan terhadap perubahan urutan. */
export function serializeQuests(state: QuestState): SavedQuests {
  const result: SavedQuests = {};
  for (const [id, progress] of Object.entries(state)) {
    const def = getQuestDef(id);
    result[id] = def ? { ...progress, objectiveIds: def.objectives.map((o) => o.id) } : progress;
  }
  return result;
}

export interface SaveContext {
  plotIds: readonly string[];
  clockConfig: ClockConfig;
  inventorySlots: number;
  speedOptions: readonly number[];
  spawn: { x: number; z: number; heading: number };
  sensitivity: { min: number; max: number; default: number };
}

export type ParseResult =
  | { ok: true; data: SaveData }
  | { ok: false; reason: "invalid-json" | "invalid-shape" | "newer-version" };

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

/** migrations[n] mengubah data versi n menjadi versi n+1. */
const migrations: Record<number, Migration> = {
  // v1 (Phase 2) -> v2 (Phase 3): menambah catatan materi yang dipelajari dan preferensi notifikasi.
  1: (data) => ({
    ...data,
    learning: { learned: [] },
    settings: { ...(isRecord(data.settings) ? data.settings : {}), prayerNotifications: true, prayerSound: false },
  }),
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = num(value, fallback);
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export function serializeSave(data: SaveData): string {
  return JSON.stringify(data);
}

function sanitizeClock(raw: unknown, ctx: SaveContext): SaveData["clock"] | null {
  if (!isRecord(raw) || !isRecord(raw.state)) return null;
  const c = ctx.clockConfig;
  const s = raw.state;
  const speed = num(s.speedMultiplier, 1);
  const candidate: GameClockState = {
    day: clampInt(s.day, 1, c.daysPerMonth, 1),
    month: clampInt(s.month, 1, c.monthsPerYear, 1),
    year: clampInt(s.year, 1, 1_000_000, 1),
    hour: clampInt(s.hour, 0, 23, 6),
    minute: clampInt(s.minute, 0, 59, 0),
    speedMultiplier: ctx.speedOptions.includes(speed) ? speed : 1,
    isPaused: false,
  };
  const normalized = fromTotalMinutes(toTotalMinutes(candidate, c), c, candidate);
  const { isPaused: _ignored, ...state } = normalized;
  void _ignored;
  return { state, accumulator: Math.min(Math.max(num(raw.accumulator, 0), 0), 0.999) };
}

function sanitizeInventory(raw: unknown, ctx: SaveContext): InventoryState {
  const stacks: ItemStack[] = [];
  const list = isRecord(raw) && Array.isArray(raw.stacks) ? raw.stacks : [];
  for (const entry of list) {
    if (!isRecord(entry) || typeof entry.itemId !== "string") continue;
    const def = getItemDef(entry.itemId);
    if (!def) continue;
    const quantity = clampInt(entry.quantity, 0, def.maxStack, 0);
    if (quantity > 0 && stacks.length < ctx.inventorySlots) stacks.push({ itemId: def.id, quantity });
  }
  return { slots: ctx.inventorySlots, stacks };
}

function sanitizePlots(raw: unknown, ctx: SaveContext): FarmPlot[] {
  const byId = new Map<string, Record<string, unknown>>();
  const list = isRecord(raw) && Array.isArray(raw.plots) ? raw.plots : [];
  for (const entry of list) if (isRecord(entry) && typeof entry.id === "string") byId.set(entry.id, entry);

  return ctx.plotIds.map((id) => {
    const entry = byId.get(id);
    const plot = createPlot(id);
    if (!entry) return plot;

    const status: PlotStatus = PLOT_STATUSES.includes(entry.status as PlotStatus) ? (entry.status as PlotStatus) : "empty";
    const hasCrop = status === "planted" || status === "growing" || status === "harvestable";
    const crop = typeof entry.cropId === "string" ? getCropDef(entry.cropId) : undefined;

    if (hasCrop && !crop) return { ...plot, status: "tilled" }; // tanaman tak dikenal: aman, kembali ke tanah terolah
    return {
      id,
      status,
      cropId: hasCrop && crop ? crop.id : null,
      growthMinutes: hasCrop && crop ? Math.min(crop.growthMinutes, Math.max(0, num(entry.growthMinutes, 0))) : 0,
      wetUntil: Math.max(0, num(entry.wetUntil, 0)),
      lastSync: Math.max(0, num(entry.lastSync, 0)),
    };
  });
}

function sanitizeQuests(raw: unknown): QuestState {
  const result: QuestState = {};
  if (!isRecord(raw)) return result;
  for (const quest of QUEST_LIST) {
    const entry = raw[quest.id];
    if (!isRecord(entry) || !QUEST_STATUSES.includes(entry.status as QuestStatus)) continue;
    const def = getQuestDef(quest.id);
    if (!def || !Array.isArray(entry.objectives)) continue;
    const saved: unknown[] = entry.objectives;
    const savedIds = Array.isArray(entry.objectiveIds) && entry.objectiveIds.every((x) => typeof x === "string") ? (entry.objectiveIds as string[]) : undefined;
    // Pemetaan berdasarkan id: dari save baru (objectiveIds) atau dari tabel layout lama berdasarkan jumlah objektif.
    const layout = savedIds ?? def.legacyObjectiveLayouts?.[saved.length];
    const objectives = def.objectives.map((o, i) => {
      const index = layout ? layout.indexOf(o.id) : i;
      return clampInt(index >= 0 ? saved[index] : 0, 0, o.count, 0);
    });
    // Definisi quest bisa berubah antar versi (objektif ditambah atau dikurangi): sesuaikan statusnya
    // agar quest tidak macet di "active" padahal semua selesai, atau "ready" padahal ada yang belum.
    const allDone = def.objectives.every((o, i) => (objectives[i] ?? 0) >= o.count);
    let status = entry.status as QuestStatus;
    if (status === "active" && allDone) status = "ready";
    else if (status === "ready" && !allDone) status = "active";
    result[quest.id] = { status, objectives };
  }
  return result;
}

function sanitizeLearning(raw: unknown): string[] {
  const list = isRecord(raw) && Array.isArray(raw.learned) ? raw.learned : [];
  const known = new Set(LEARNING_CONTENT.map((c) => c.id));
  const result: string[] = [];
  for (const id of list) if (typeof id === "string" && known.has(id) && !result.includes(id)) result.push(id);
  return result;
}

export function parseSave(raw: string, ctx: SaveContext): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "invalid-json" };
  }
  if (!isRecord(parsed) || typeof parsed.version !== "number" || !Number.isInteger(parsed.version) || parsed.version < 1) {
    return { ok: false, reason: "invalid-shape" };
  }
  if (parsed.version > SAVE_VERSION) return { ok: false, reason: "newer-version" };

  let data: Record<string, unknown> = parsed;
  for (let v = parsed.version; v < SAVE_VERSION; v++) {
    const migrate = migrations[v];
    if (!migrate) return { ok: false, reason: "invalid-shape" };
    data = migrate(data);
  }

  const clock = sanitizeClock(data.clock, ctx);
  if (!clock) return { ok: false, reason: "invalid-shape" };

  const player = isRecord(data.player) ? data.player : {};
  const settings = isRecord(data.settings) ? data.settings : {};
  const profile = isRecord(data.profile) ? data.profile : {};
  const { min, max } = ctx.sensitivity;

  return {
    ok: true,
    data: {
      version: SAVE_VERSION,
      savedAt: num(data.savedAt, 0),
      profile: { name: typeof profile.name === "string" && profile.name.trim() ? profile.name.slice(0, 24) : "Pemain" },
      player: {
        x: num(player.x, ctx.spawn.x),
        z: num(player.z, ctx.spawn.z),
        heading: num(player.heading, ctx.spawn.heading),
      },
      clock,
      inventory: sanitizeInventory(data.inventory, ctx),
      farm: { plots: sanitizePlots(data.farm, ctx) },
      quests: sanitizeQuests(data.quests),
      learning: { learned: sanitizeLearning(data.learning) },
      settings: {
        cameraSensitivity: Math.min(max, Math.max(min, num(settings.cameraSensitivity, ctx.sensitivity.default))),
        showFps: settings.showFps === true,
        prayerNotifications: settings.prayerNotifications !== false,
        prayerSound: settings.prayerSound === true,
      },
    },
  };
}
