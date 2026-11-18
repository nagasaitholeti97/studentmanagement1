import { useEffect, useState } from "react";
import { getClassStudents, getSavedAttendance, getTeachingPeriods, markAttendance } from "../api";
import { periodTime, runningPeriod, todayLocal } from "../lib/periods";
import type { ClassStudent, Status, TeachingPeriod } from "../types";
import { ErrorBox } from "./ui";

const PRESENT = "PRESENT" as Status;
const ABSENT = "ABSENT" as Status;

export default function AttendanceMarker({ classId }: { classId: string }) {
    const [date, setDate] = useState(todayLocal());
    const [students, setStudents] = useState<ClassStudent[]>([]);
    const [periods, setPeriods] = useState<TeachingPeriod[]>([]);
    const [period, setPeriod] = useState<number | null>(null);
    const [marks, setMarks] = useState<Record<string, Status>>({});
    const [alreadyPosted, setAlreadyPosted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // 1. students of the class
    useEffect(() => {
        let off = false;
        getClassStudents(classId)
            .then((s) => { if (!off) setStudents(s); })
            .catch((e) => { if (!off) setErr((e as Error).message); });
        return () => { off = true; };
    }, [classId]);

    // 2. periods of the chosen date (every teacher sees all periods)
    useEffect(() => {
        let off = false;
        getTeachingPeriods(classId, date)
            .then((list) => {
                if (off) return;
                setPeriods(list);
                setPeriod((cur) => {
                    if (cur !== null && list.some((p) => p.period === cur)) return cur;
                    const now = date === todayLocal() ? runningPeriod() : null;
                    return (list.find((p) => p.period === now) ?? list.find((p) => p.own) ?? list[0])?.period ?? null;
                });
            })
            .catch((e) => { if (!off) setErr((e as Error).message); });
        return () => { off = true; };
    }, [classId, date]);

    // 3. attendance already posted for this date + period (if any)
    useEffect(() => {
        if (period === null) { setMarks({}); setAlreadyPosted(false); return; }
        let off = false;
        setLoading(true); setDone(false); setErr(null);
        getSavedAttendance(classId, date, period)
            .then((saved) => {
                if (off) return;
                const byId = new Map(saved.map((m) => [m.studentId, m.status]));
                const next: Record<string, Status> = {};
                for (const s of students) next[s.studentId] = byId.get(s.studentId) ?? PRESENT;
                setMarks(next);
                setAlreadyPosted(saved.length > 0);
            })
            .catch((e) => { if (!off) setErr((e as Error).message); })
            .finally(() => { if (!off) setLoading(false); });
        return () => { off = true; };
    }, [classId, date, period, students]);

    const setMark = (id: string, status: Status) => {
        setMarks((m) => ({ ...m, [id]: status }));
        setDone(false);
    };
    const setAll = (status: Status) => {
        setMarks(Object.fromEntries(students.map((s) => [s.studentId, status])));
        setDone(false);
    };

    async function submit() {
        if (period === null) return;
        setBusy(true); setErr(null); setDone(false);
        try {
            await markAttendance({
                classId, date, period,
                records: students.map((s) => ({ studentId: s.studentId, status: marks[s.studentId] ?? PRESENT })),
            });
            setAlreadyPosted(true);
            setDone(true);
            getTeachingPeriods(classId, date).then(setPeriods).catch(() => { }); // refreshes the "✓ saved" marks
        } catch (e) {
            setErr((e as Error).message);
        } finally {
            setBusy(false);
        }
    }

    const label = (p: TeachingPeriod) =>
        `Period ${p.period} · ${p.subject} (${periodTime(p.period)})${p.saved ? "  ✓ saved" : ""}`;
    const own = periods.filter((p) => p.own);
    const others = periods.filter((p) => !p.own);
    const selected = periods.find((p) => p.period === period);
    const absentCount = students.filter((s) => marks[s.studentId] === ABSENT).length;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
                <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-600">Date</span>
                    <input type="date" className="input" value={date} max={todayLocal()}
                        onChange={(e) => e.target.value && setDate(e.target.value)} />
                </label>

                <label className="block min-w-[16rem]">
                    <span className="mb-1 block text-sm font-medium text-slate-600">Period</span>
                    <select className="input" value={period ?? ""} disabled={periods.length === 0}
                        onChange={(e) => setPeriod(Number(e.target.value))}>
                        {periods.length === 0 && <option value="">No classes on this day</option>}
                        {own.length > 0 && (
                            <optgroup label="My periods">
                                {own.map((p) => <option key={p.period} value={p.period}>{label(p)}</option>)}
                            </optgroup>
                        )}
                        {others.length > 0 && (
                            <optgroup label="Other periods (substitute / free period)">
                                {others.map((p) => <option key={p.period} value={p.period}>{label(p)}</option>)}
                            </optgroup>
                        )}
                    </select>
                </label>
            </div>

            {selected && !selected.own && (
                <p className="rounded-lg bg-brand-tint px-3 py-2 text-sm text-brand-dark">
                    You are taking this period as a substitute for {selected.subject}.
                </p>
            )}
            {alreadyPosted && !done && (
                <p className="rounded-lg border border-brand bg-brand-tint px-3 py-2 text-sm text-brand-dark">
                    Attendance for this period was already posted. The saved attendance is shown below; you can change it and submit again.
                </p>
            )}
            {done && (
                <p role="status" className="rounded-lg border border-brand bg-brand-tint px-3 py-2 text-sm font-semibold text-brand-dark">
                    ✓ Attendance submitted successfully.
                </p>
            )}
            {err && <ErrorBox message={err} />}

            {period !== null && (
                <section className="rounded-xl border border-slate-200 bg-white/90">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 text-sm">
                        <span className="text-slate-600">
                            {students.length - absentCount} present · {absentCount} absent
                        </span>
                        <span className="flex gap-2">
                            <button type="button" className="btn-ghost !py-1" onClick={() => setAll(PRESENT)}>All present</button>
                            <button type="button" className="btn-ghost !py-1" onClick={() => setAll(ABSENT)}>All absent</button>
                        </span>
                    </div>

                    <ul className={loading ? "opacity-50" : ""}>
                        {students.map((s) => {
                            const status = marks[s.studentId] ?? PRESENT;
                            return (
                                <li key={s.studentId} className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 last:border-b-0">
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold">{s.name}</div>
                                        <div className="text-xs text-slate-500">{s.rollNo}</div>
                                    </div>
                                    <div className="flex shrink-0 gap-1.5">
                                        <button type="button" aria-pressed={status === PRESENT}
                                            onClick={() => setMark(s.studentId, PRESENT)}
                                            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${status === PRESENT ? "border-present bg-present text-white" : "border-slate-300 bg-white text-slate-600"}`}>
                                            Present
                                        </button>
                                        <button type="button" aria-pressed={status === ABSENT}
                                            onClick={() => setMark(s.studentId, ABSENT)}
                                            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${status === ABSENT ? "border-absent bg-absent text-white" : "border-slate-300 bg-white text-slate-600"}`}>
                                            Absent
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="border-t border-slate-200 px-4 py-3">
                        <button type="button" onClick={submit}
                            disabled={busy || loading || students.length === 0}
                            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
                            {busy ? "Submitting…" : alreadyPosted ? "Update attendance" : "Submit attendance"}
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}