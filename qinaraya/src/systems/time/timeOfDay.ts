export type TimeOfDay = "pagi" | "siang" | "sore" | "malam";

/** Pembagian waktu untuk sapaan dan suasana. Hanya membaca jam dari Game Clock. */
export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 11) return "pagi";
  if (hour >= 11 && hour < 15) return "siang";
  if (hour >= 15 && hour < 18) return "sore";
  return "malam";
}

export function formatClock(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}.${String(minute).padStart(2, "0")}`;
}
