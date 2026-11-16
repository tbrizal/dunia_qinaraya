import { prayerScheduleConfig } from "../config/lifestyleConfig";
import { getVisibleActivity } from "../data/activities";
import { PRAYER_LABELS, getActivePrayer, getNextPrayer } from "../systems/prayer/prayerSchedule";
import { gameClock } from "../systems/time/gameClockInstance";
import { formatClock } from "../systems/time/timeOfDay";
import { recordQuestEvent } from "./gameActions";
import { useUiStore } from "./useUiStore";

/**
 * Aktivitas terpandu (latihan wudu, jeda salat). Tidak ada skor, hadiah, pencatatan "sudah salat",
 * atau penalti. Hanya latihan wudu yang dihitung sebagai objektif quest belajar, dan itu pun latihan mengenal.
 */

export function openActivity(activityId: string): void {
  const ui = useUiStore.getState();
  const activity = getVisibleActivity(activityId);
  if (!activity) {
    ui.showToast("Aktivitas ini belum tersedia");
    return;
  }

  const clock = gameClock.getState();
  const active = getActivePrayer(clock.hour, clock.minute, prayerScheduleConfig);
  if (activity.availability === "prayer-window" && !active) {
    const next = getNextPrayer(clock.hour, clock.minute, prayerScheduleConfig);
    ui.showToast(next ? `Belum waktu salat. Berikutnya ${PRAYER_LABELS[next.prayer]} ${formatClock(next.hour, next.minute)}` : "Belum waktu salat");
    return;
  }

  ui.setActivity({ activityId, step: 0, prayerLabel: active ? PRAYER_LABELS[active.prayer] : "" });
}

export function closeActivity(): void {
  useUiStore.getState().setActivity(null);
}

export function activityPrev(): void {
  const { activity, setActivity } = useUiStore.getState();
  if (activity && activity.step > 0) setActivity({ ...activity, step: activity.step - 1 });
}

/** Langkah berikutnya; di halaman penutup berarti selesai. */
export function activityNext(): void {
  const { activity, setActivity } = useUiStore.getState();
  if (!activity) return;
  const def = getVisibleActivity(activity.activityId);
  if (!def) return closeActivity();
  if (activity.step < def.steps.length) setActivity({ ...activity, step: activity.step + 1 });
  else finishActivity();
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
