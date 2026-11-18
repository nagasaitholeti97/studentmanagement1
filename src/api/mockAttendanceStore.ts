import type { MarkAttendanceRequest, Status } from "../types";

const KEY = "mock-attendance-v1";
type Store = Record<string, Status>; // key: studentId|date|period

const read = (): Store => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
};

export function saveAttendance(req: MarkAttendanceRequest) {
    const store = read();
    for (const r of req.records) store[`${r.studentId}|${req.date}|${req.period}`] = r.status;
    localStorage.setItem(KEY, JSON.stringify(store));
}

export function getStatus(studentId: string, date: string, period: number): Status | undefined {
    return read()[`${studentId}|${date}|${period}`];
}