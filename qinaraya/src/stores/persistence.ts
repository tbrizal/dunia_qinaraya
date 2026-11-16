import { gameConfig } from "../config/gameConfig";
import { prayerNoticeConfig, prayerScheduleConfig } from "../config/lifestyleConfig";
import { PRAYER_LABELS, getPrayerNotifications } from "../systems/prayer/prayerSchedule";
import { playSoftChime } from "../systems/audio/softChime";
import { resolveCollisions } from "../systems/movement/collision";
import { createInventory } from "../systems/inventory/inventory";
import { playerState, resetPlayerState } from "../systems/player/playerState";
import { SAVE_VERSION, parseSave, serializeQuests, serializeSave } from "../systems/save/saveSystem";
import type { SaveContext, SaveData } from "../systems/save/saveSystem";
import { clockConfig, createInitialClockState, gameClock } from "../systems/time/gameClockInstance";
import { villageLayout } from "../worlds/qinaraya-village/villageLayout";
import { useFarmStore } from "./useFarmStore";
import { useInventoryStore } from "./useInventoryStore";
import { useLearningStore } from "./useLearningStore";
import { useQuestStore } from "./useQuestStore";
import { useSettingsStore } from "./useSettingsStore";
import { useUiStore } from "./useUiStore";

/** Menghubungkan store ke penyimpanan lokal. Aturan format dan validasi ada di systems/save. */

const saveCtx: SaveContext = {
  plotIds: villageLayout.gardenPlots.map((p) => p.id),
  clockConfig,
  inventorySlots: gameConfig.inventory.slots,
  speedOptions: gameConfig.clock.speedOptions,
  spawn: gameConfig.player.spawn,
  sensitivity: {
    min: gameConfig.settings.sensitivityMin,
    max: gameConfig.settings.sensitivityMax,
    default: gameConfig.settings.sensitivityDefault,
  },
};

/** Kunci stabil; versi format ada di dalam data (field `version`) dan dimigrasikan saat dibaca. */
const SAVE_KEY = gameConfig.save.key;
/** Kunci Phase 2 yang memuat nomor versi. Tetap dibaca agar kemajuan lama tidak hilang. */
const LEGACY_KEYS = [`${gameConfig.save.key}.v1`];
const BACKUP_KEY = `${gameConfig.save.key}.backup`;

/** True bila ada save versi lebih baru: jangan menimpanya sampai pemain memilih game baru. */
let saveLocked = false;
let profileName = "Pemain";

function getStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null; // mode privat atau akses ditolak
  }
}

export function buildSaveData(): SaveData {
  const { isPaused: _paused, ...clockState } = gameClock.getState();
  void _paused;
  const settings = useSettingsStore.getState();
  return {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    profile: { name: profileName },
    player: { x: playerState.x, z: playerState.z, heading: playerState.heading },
    clock: { state: clockState, accumulator: gameClock.getAccumulator() },
    inventory: useInventoryStore.getState().inventory,
    farm: { plots: Object.values(useFarmStore.getState().plots) },
    quests: serializeQuests(useQuestStore.getState().quests),
    learning: { learned: useLearningStore.getState().learned },
    settings: {
      cameraSensitivity: settings.cameraSensitivity,
      showFps: settings.showFps,
      prayerNotifications: settings.prayerNotifications,
      prayerSound: settings.prayerSound,
    },
  };
}

function applySaveData(data: SaveData): void {
  profileName = data.profile.name;

  // Posisi aman: tata letak desa mungkin berubah sejak save dibuat.
  const pos = { x: data.player.x, z: data.player.z };
  resolveCollisions(pos, gameConfig.player.radius, villageLayout.colliders, villageLayout.bounds);
  playerState.x = pos.x;
  playerState.z = pos.z;
  playerState.vx = 0;
  playerState.vz = 0;
  playerState.heading = data.player.heading;

  useInventoryStore.getState().setInventory(data.inventory);
  useFarmStore.getState().setPlots(data.farm.plots);
  useQuestStore.getState().setQuests(data.quests);
  useLearningStore.getState().setLearned(data.learning.learned);
  useSettingsStore.setState({ ...data.settings });
  gameClock.setState({ ...data.clock.state, isPaused: false }, data.clock.accumulator);
}

function applyNewGame(): void {
  profileName = "Pemain";
  resetPlayerState();
  useInventoryStore.setState({ inventory: createInventory(gameConfig.inventory.slots) });
  useFarmStore.getState().reset(saveCtx.plotIds);
  useQuestStore.getState().reset();
  useLearningStore.getState().reset();
  gameClock.setState(createInitialClockState(), 0);
}

export function saveGame(): boolean {
  const storage = getStorage();
  if (!storage || saveLocked) return false;
  try {
    storage.setItem(SAVE_KEY, serializeSave(buildSaveData()));
    return true;
  } catch {
    return false; // penyimpanan penuh atau tidak tersedia; game tetap berjalan
  }
}

/** Dipanggil sekali sebelum render pertama. Memuat save bila ada, selain itu memulai game baru. */
export function bootstrapGame(): "loaded" | "new" {
  const storage = getStorage();
  let raw: string | null = null;
  let fromLegacy = false;
  if (storage) {
    try {
      raw = storage.getItem(SAVE_KEY);
      if (!raw) {
        for (const key of LEGACY_KEYS) {
          raw = storage.getItem(key);
          if (raw) {
            fromLegacy = true;
            break;
          }
        }
      }
    } catch {
      raw = null;
    }
  }

  if (storage && raw) {
    const result = parseSave(raw, saveCtx);
    if (result.ok) {
      applySaveData(result.data);
      if (fromLegacy) saveGame(); // pindahkan ke kunci baru; kunci lama dibiarkan sebagai cadangan
      return "loaded";
    }
    if (result.reason === "newer-version") {
      saveLocked = true;
    } else {
      try {
        storage.setItem(BACKUP_KEY, raw); // simpan salinan data rusak sebelum ditimpa
      } catch {
        /* abaikan */
      }
    }
  }
  applyNewGame();
  return "new";
}

export function startNewGame(): void {
  saveLocked = false;
  applyNewGame();
  saveGame();
}

/** Menyalakan autosave berkala, simpan saat tab disembunyikan, dan simpan setelah perubahan penting. */
export function startAutosave(): () => void {
  let timer: number | undefined;
  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(saveGame, gameConfig.save.debounceMs);
  };

  const unsubs = [
    useInventoryStore.subscribe(schedule),
    useFarmStore.subscribe((state, prev) => {
      // syncAll mengubah petak tiap menit game; cukup simpan berkala, bukan tiap perubahan kecil.
      const changed = Object.keys(state.plots).some(
        (id) => state.plots[id]?.status !== prev.plots[id]?.status || state.plots[id]?.cropId !== prev.plots[id]?.cropId,
      );
      if (changed) schedule();
    }),
    useQuestStore.subscribe(schedule),
    useLearningStore.subscribe(schedule),
    useSettingsStore.subscribe((state, prev) => {
      if (
        state.cameraSensitivity !== prev.cameraSensitivity ||
        state.showFps !== prev.showFps ||
        state.prayerNotifications !== prev.prayerNotifications ||
        state.prayerSound !== prev.prayerSound
      ) {
        schedule();
      }
    }),
  ];

  const interval = window.setInterval(saveGame, gameConfig.save.autosaveSeconds * 1000);
  const onHide = () => {
    if (document.hidden) saveGame();
  };
  const onPageHide = () => {
    saveGame();
  };
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", onPageHide);

  return () => {
    window.clearTimeout(timer);
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", onPageHide);
    for (const off of unsubs) off();
  };
}

/** Menghubungkan Game Clock ke modul lain: satu langganan pusat, tanpa timer per tanaman atau per notifikasi. */
export function connectSystemsToClock(): () => void {
  useFarmStore.getState().syncAll(gameClock.getTotalMinutes());
  return gameClock.subscribe((event) => {
    if (event.minutesAdvanced > 0 || event.type === "set") {
      useFarmStore.getState().syncAll(event.totalMinutes);
    }

    // Pengingat waktu salat simulasi: lembut, sekali per kejadian, dan tidak ada konsekuensi bila diabaikan.
    const settings = useSettingsStore.getState();
    if (!settings.prayerNotifications) return;
    const [notice] = getPrayerNotifications(event, prayerScheduleConfig, prayerNoticeConfig.maxJumpMinutes);
    if (!notice) return;
    useUiStore.getState().showPrayerNotice(`Waktu ${PRAYER_LABELS[notice.prayer]} telah tiba di Qinaraya`);
    if (settings.prayerSound) playSoftChime();
  });
}
