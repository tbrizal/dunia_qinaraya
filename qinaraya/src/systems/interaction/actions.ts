import { CROP_LIST, getCropDef } from "../../data/crops.ts";
import { getItemDef } from "../../data/items.ts";
import { prayerScheduleConfig } from "../../config/lifestyleConfig.ts";
import { getVisibleActivity } from "../../data/activities.ts";
import { getVisibleLearningContent } from "../../data/learning.ts";
import { getNpcDef } from "../../data/npcs.ts";
import { getPlaceDef } from "../../data/places.ts";
import { isWet, getGrowthProgress } from "../farming/farmPlot.ts";
import type { FarmPlot } from "../farming/farmPlot.ts";
import { canAdd, hasItem } from "../inventory/inventory.ts";
import { PRAYER_LABELS, getActivePrayer, getNextPrayer } from "../prayer/prayerSchedule.ts";
import type { PrayerScheduleEntry } from "../prayer/prayerSchedule.ts";
import type { InventoryState } from "../inventory/inventory.ts";

/** Menentukan aksi yang tersedia untuk sebuah target. Murni: tanpa efek samping. */

export interface ActionOption {
  /** till | plant:<cropId> | plant:none | water | harvest | talk */
  id: string;
  label: string;
  enabled: boolean;
  /** Alasan bila tidak aktif. */
  hint?: string;
}

export interface TargetView {
  title: string;
  status?: string;
  actions: ActionOption[];
}

function itemName(id: string): string {
  return getItemDef(id)?.name ?? id;
}

export function plotNumber(plotId: string): string {
  return plotId.replace(/^plot-/, "");
}

export function describePlot(plot: FarmPlot, inventory: InventoryState): TargetView {
  const title = `Petak kebun ${plotNumber(plot.id)}`;
  const wet = isWet(plot);
  const hasCan = hasItem(inventory, "watering_can");
  const water: ActionOption = { id: "water", label: "Siram", enabled: hasCan, hint: hasCan ? undefined : "Butuh penyiram" };
  const crop = plot.cropId ? getCropDef(plot.cropId) : undefined;

  switch (plot.status) {
    case "empty": {
      const hasHoe = hasItem(inventory, "hoe");
      return {
        title,
        status: "Tanah belum diolah",
        actions: [{ id: "till", label: "Cangkul tanah", enabled: hasHoe, hint: hasHoe ? undefined : "Butuh cangkul" }],
      };
    }
    case "tilled": {
      const plantable = CROP_LIST.filter((c) => hasItem(inventory, c.seedItemId));
      const plantActions: ActionOption[] =
        plantable.length > 0
          ? plantable.map((c) => ({ id: `plant:${c.id}`, label: `Tanam ${c.name.toLowerCase()}`, enabled: true }))
          : [{ id: "plant:none", label: "Tanam", enabled: false, hint: "Butuh benih" }];
      return {
        title,
        status: wet ? "Tanah siap ditanami, sudah basah" : "Tanah siap ditanami",
        actions: [...plantActions, water],
      };
    }
    case "planted":
    case "growing": {
      const percent = Math.floor(getGrowthProgress(plot) * 100);
      const name = crop?.name ?? "Tanaman";
      return {
        title,
        status: `${name}: tumbuh ${percent}%${wet ? "" : ", butuh air"}`,
        actions: [water],
      };
    }
    case "harvestable": {
      const name = crop?.name ?? "Tanaman";
      const fits = crop ? canAdd(inventory, crop.harvestItemId, crop.yield) : false;
      return {
        title,
        status: `${name} siap dipanen`,
        actions: [{ id: "harvest", label: "Panen", enabled: fits, hint: fits ? undefined : "Tas penuh" }],
      };
    }
  }
}

export function describeNpc(npcId: string): TargetView | null {
  const npc = getNpcDef(npcId);
  if (!npc) return null;
  return {
    title: npc.name,
    status: npc.role,
    actions: [{ id: "talk", label: `Bicara dengan ${npc.name}`, enabled: true }],
  };
}

export interface ClockTime {
  hour: number;
  minute: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Lokasi (masjid dan tempat wudu). Materi dan aktivitas yang belum boleh tampil di build ini tidak
 * muncul sebagai aksi. Salat sungguhan hanya saat waktunya berlangsung; di luar itu tersedia
 * "Latihan salat" (bila diizinkan) atau tampil redup dengan penjelasan kapan tersedia. Mengembalikan null bila lokasi tidak punya aksi sama sekali.
 */
export function describePoi(
  placeId: string,
  learned: readonly string[],
  clock: ClockTime = { hour: 12, minute: 0 },
  allowUnreviewed?: boolean,
  schedule: readonly PrayerScheduleEntry[] = prayerScheduleConfig,
): TargetView | null {
  const place = getPlaceDef(placeId);
  if (!place) return null;

  const actions: ActionOption[] = [];
  let shown = 0;
  let done = 0;
  for (const contentId of place.contentIds) {
    const content = getVisibleLearningContent(contentId, allowUnreviewed);
    if (!content) continue;
    shown++;
    const isDone = learned.includes(contentId);
    if (isDone) done++;
    actions.push({ id: `learn:${contentId}`, label: isDone ? `${content.shortTitle} (sudah)` : content.shortTitle, enabled: true });
  }

  const active = getActivePrayer(clock.hour, clock.minute, schedule);
  for (const activityId of place.activityIds) {
    const activity = getVisibleActivity(activityId, allowUnreviewed);
    if (!activity) continue;
    const prayerLabel = active ? PRAYER_LABELS[active.prayer] : "";
    if (activity.availability === "prayer-window" && !active) {
      if (activity.practiceOutsideWindow) {
        // Di luar waktu salat tetap bisa berlatih: pemain memilih salat yang ingin dipelajari.
        actions.push({ id: `activity:${activity.id}`, label: activity.practiceLabel ?? "Latihan", enabled: true });
      } else {
        const next = getNextPrayer(clock.hour, clock.minute, schedule);
        const hint = next ? `Belum waktu salat. Berikutnya ${PRAYER_LABELS[next.prayer]} ${pad(next.hour)}.${pad(next.minute)}` : "Belum waktu salat";
        actions.push({ id: `activity:${activity.id}`, label: activity.actionLabel.replace("{prayer}", "").trim(), enabled: false, hint });
      }
    } else {
      actions.push({ id: `activity:${activity.id}`, label: activity.actionLabel.replace("{prayer}", prayerLabel).trim(), enabled: true });
    }
  }

  if (place.activities.includes("clean")) actions.push({ id: "clean", label: "Bersihkan halaman", enabled: true });
  if (actions.length === 0) return null;

  return {
    title: place.name,
    status: shown > 0 ? `${place.blurb}. Dipelajari ${done}/${shown}` : place.blurb,
    actions,
  };
}

export { itemName };
