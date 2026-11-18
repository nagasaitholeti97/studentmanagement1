import { PERIOD_TIMES } from "../config";

const minutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};

export const ALL_PERIODS = PERIOD_TIMES.map((p) => p.period);

/** "10:50–11:40" for a period, or "" if the period has no bell timing. */
export function periodTime(period: number) {
    const t = PERIOD_TIMES.find((x) => x.period === period);
    return t ? `${t.start}–${t.end}` : "";
}

/** The period that is running at this moment, or null (break, lunch, before or after college hours). */
export function runningPeriod(now = new Date()): number | null {
    const m = now.getHours() * 60 + now.getMinutes();
    return PERIOD_TIMES.find((t) => m >= minutes(t.start) && m < minutes(t.end))?.period ?? null;
}

/** Today's date as yyyy-mm-dd in the user's own time zone. */
export function todayLocal() {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}