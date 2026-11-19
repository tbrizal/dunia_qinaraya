import { prayerScheduleConfig } from "../config/lifestyleConfig";
import { getVisibleActivity } from "../data/activities";
import type { PrayerId } from "../data/worship";
import { getWorshipGuide } from "../data/worship";
import { PRAYER_LABELS, getActivePrayer, getNextPrayer } from "../systems/prayer/prayerSchedule";
import { gameClock } from "../systems/time/gameClockInstance";
import { formatClock } from "../systems/time/timeOfDay";
import { beginPerformance, endPerformance, playClip } from "../systems/worship/performance";
import { lastPoseOf } from "../systems/worship/poseLibrary";
import { buildSalatSteps, buildWuduSteps, prayerName } from "../systems/worship/sequences";
import { WORSHIP_STAGES } from "../worlds/qinaraya-village/worshipStages";
import { recordQuestEvent } from "./gameActions";
import { useUiStore } from "./useUiStore";

/**
 * Aktivitas wudu dan salat terpandu dengan animasi 3D. Tidak ada skor, hadiah, pencatatan "sudah salat",
 * atau penalti. Hanya latihan wudu yang dihitung sebagai objektif quest belajar (latihan mengenal).
 */

function startPlaying(prayer: PrayerId | null, steps: ReturnType<typeof buildWuduSteps>, practice: boolean): void {
  const ui = useUiStore.getState();
  const current = ui.activity;
  if (!current) return;
  const guide = getWorshipGuide();
  ui.setActivity({
    ...current,
    stage: "play",
    practice,
    prayer,
    prayerLabel: prayer && guide ? prayerName(prayer, guide) : "",
    steps,
    index: 0,
    replay: 0,
  });
  if (steps[0]) playClip(steps[0].clip);
}

export function openActivity(activityId: string): void {
  const ui = useUiStore.getState();
  const activity = getVisibleActivity(activityId);
  const guide = getWorshipGuide();
  if (!activity || !guide) {
    ui.showToast("Aktivitas ini belum tersedia");
    return;
  }

  const clock = gameClock.getState();
  const active = getActivePrayer(clock.hour, clock.minute, prayerScheduleConfig);
  const base = { activityId, kind: activity.kind, title: activity.title, stage: "play" as const, practice: false, prayer: null, prayerLabel: "", steps: [], index: 0, replay: 0 };

  if (activity.kind === "wudu") {
    ui.setActivity(base);
    beginPerformance(WORSHIP_STAGES.wudu);
    startPlaying(null, buildWuduSteps(guide), false);
    return;
  }

  if (active) {
    ui.setActivity({ ...base, stage: "play" });
    beginPerformance(WORSHIP_STAGES.salat);
    startPlaying(active.prayer, buildSalatSteps(active.prayer, guide), false);
    return;
  }

  if (activity.practiceOutsideWindow) {
    ui.setActivity({ ...base, stage: "choose", practice: true });
    beginPerformance(WORSHIP_STAGES.salat);
    return;
  }

  const next = getNextPrayer(clock.hour, clock.minute, prayerScheduleConfig);
  ui.showToast(next ? `Belum waktu salat. Berikutnya ${PRAYER_LABELS[next.prayer]} ${formatClock(next.hour, next.minute)}` : "Belum waktu salat");
}

/** Memilih salat yang akan dipelajari (latihan di luar waktu salat). */
export function choosePrayer(prayer: PrayerId): void {
  const guide = getWorshipGuide();
  const { activity } = useUiStore.getState();
  if (!guide || !activity || activity.kind !== "salat" || activity.stage !== "choose") return;
  startPlaying(prayer, buildSalatSteps(prayer, guide), true);
}

function playStep(index: number): void {
  const { activity } = useUiStore.getState();
  const step = activity?.steps[index];
  if (step) playClip(step.clip);
}

export function activityPrev(): void {
  const { activity, setActivity } = useUiStore.getState();
  if (!activity || activity.stage !== "play" || activity.index <= 0) return;
  const index = activity.index - 1;
  setActivity({ ...activity, index });
  playStep(index);
}

/** Langkah berikutnya; di halaman penutup berarti selesai. */
export function activityNext(): void {
  const { activity, setActivity } = useUiStore.getState();
  if (!activity || activity.stage !== "play") return;
  if (activity.index >= activity.steps.length) return finishActivity();
  const index = activity.index + 1;
  setActivity({ ...activity, index });
  if (index < activity.steps.length) playStep(index);
  else playClip("return-stand");
}

/** Memutar ulang gerakan langkah saat ini: pose dimundurkan ke akhir langkah sebelumnya, lalu klip diputar. */
export function activityReplay(): void {
  const { activity, setActivity } = useUiStore.getState();
  if (!activity || activity.stage !== "play") return;
  const step = activity.steps[activity.index];
  if (!step) return;
  const previous = activity.index > 0 ? lastPoseOf(activity.steps[activity.index - 1]!.clip) : "stand";
  setActivity({ ...activity, replay: activity.replay + 1 });
  playClip(`pose:${previous}|${step.clip}`);
}

export function closeActivity(): void {
  useUiStore.getState().setActivity(null);
  endPerformance();
}

export function finishActivity(): void {
  const { activity, showToast } = useUiStore.getState();
  if (!activity) return;
  const def = getVisibleActivity(activity.activityId);
  closeActivity();
  if (!def) return;
  if (def.kind === "wudu") {
    showToast("Latihan wudu selesai");
    recordQuestEvent({ type: "practice", activityId: def.id });
  } else {
    showToast("Terima kasih sudah berhenti sejenak");
  }
}
