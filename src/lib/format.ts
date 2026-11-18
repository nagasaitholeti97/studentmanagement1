export const pct = (attended: number, held: number) => (held === 0 ? 0 : Math.round((attended / held) * 1000) / 10);
export const MIN_PERCENT = 75;
export const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
export const monthKey = (iso: string) => iso.slice(0, 7);
export const monthLabel = (key: string) =>
  new Date(key + "-01T00:00:00").toLocaleDateString("en-IN", { month: "long", year: "numeric" });
/** Percentage with two decimals, as in the college report (0 classes held -> 0.00). */
export const pct2 = (attended: number, held: number) => (held === 0 ? 0 : (attended / held) * 100);
export const BORDERLINE_UPTO = 80; // 75% to just under 80% is "Borderline"
export type SubjectStatus = "Good" | "Borderline" | "Shortage";
export const statusFor = (value: number): SubjectStatus =>
  value < MIN_PERCENT ? "Shortage" : value < BORDERLINE_UPTO ? "Borderline" : "Good";

/** canMiss: classes that can still be missed and stay at MIN_PERCENT. mustAttend: classes in a row needed to reach it. */
export function adviceFor(attended: number, held: number) {
  const p = MIN_PERCENT;
  return {
    canMiss: Math.max(0, Math.floor((100 * attended - p * held) / p)),
    mustAttend: Math.max(0, Math.ceil((p * held - 100 * attended) / (100 - p))),
  };
}
