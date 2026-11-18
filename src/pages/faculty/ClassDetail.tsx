
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getClass,
  getClassStudents,
  getSavedAttendance,
  getTeachingPeriods,
  markAttendance,
} from "../../api";
import { ErrorBox, Loading } from "../../components/ui";
import {
  ALL_PERIODS,
  periodTime,
  runningPeriod,
  todayLocal,
} from "../../lib/periods";
import { useAsync } from "../../lib/useAsync";
import type { Status, TeachingPeriod } from "../../types";

type View = "update" | "list";

export default function ClassDetail() {
  const { classId = "" } = useParams();
  const cls = useAsync(() => getClass(classId), [classId]);
  const students = useAsync(() => getClassStudents(classId), [classId]);

  const [view, setView] = useState<View>("update");
  const [date, setDate] = useState(todayLocal());
  const teaching = useAsync(
    () => getTeachingPeriods(classId, date),
    [classId, date]
  );

  const [period, setPeriod] = useState<number | null>(null);
  const [justSaved, setJustSaved] = useState<number[]>([]);
  const [marks, setMarks] = useState<Record<string, Status>>({});
  const [hasSaved, setHasSaved] = useState(false);
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  // Default period selection
  useEffect(() => {
    if (teaching.loading) return;

    const list = teaching.data ?? [];
    const running = date === todayLocal() ? runningPeriod() : null;

    const pick =
      list.find((t) => t.period === running) ??
      list.find((t) => t.own !== false && !t.saved) ??
      list.find((t) => !t.saved) ??
      list[0];

    setPeriod(pick ? pick.period : running ?? 1);
    setJustSaved([]);
    setNote(null);
  }, [teaching.data, teaching.loading, date]);

  // Load saved attendance
  useEffect(() => {
    const roster = students.data;

    if (period === null || !roster) return;

    let alive = true;

    const base = (): Record<string, Status> =>
      Object.fromEntries(
        roster.map((s) => [s.studentId, "PRESENT" as Status])
      );

    setLoadingMarks(true);

    getSavedAttendance(classId, date, period)
      .then((saved) => {
        if (!alive) return;

        const next = base();

        for (const m of saved) {
          next[m.studentId] = m.status;
        }

        setMarks(next);
        setHasSaved(saved.length > 0);
      })
      .catch(() => {
        if (alive) {
          setMarks(base());
          setHasSaved(false);
        }
      })
      .finally(() => alive && setLoadingMarks(false));

    return () => {
      alive = false;
    };
  }, [classId, date, period, students.data]);

  if (cls.loading || students.loading) return <Loading />;

  if (cls.error || students.error || !cls.data) {
    return (
      <ErrorBox
        message={cls.error ?? students.error ?? "Class not found."}
      />
    );
  }

  const list = students.data ?? [];
  const absent = Object.values(marks).filter(
    (m) => m === "ABSENT"
  ).length;

  const hours = teaching.data ?? [];

  const alreadySaved =
    hasSaved || (period !== null && justSaved.includes(period));

  // Period dropdown options
  const options: TeachingPeriod[] =
    hours.length > 0
      ? hours
      : ALL_PERIODS.map((p) => ({
        period: p,
        subject: "",
        saved: false,
        own: true,
      }));

  const mine = options.filter((o) => o.own !== false);
  const others = options.filter((o) => o.own === false);

  const selected = options.find((o) => o.period === period);

  const optionText = (h: TeachingPeriod) => {
    const time = periodTime(h.period);
    const saved = h.saved || justSaved.includes(h.period);

    return `Period ${h.period}${h.subject ? ` · ${h.subject}` : ""
      }${time ? ` (${time})` : ""}${saved ? " · Saved" : ""}`;
  };

  const setAll = (status: Status) =>
    setMarks(
      Object.fromEntries(
        list.map((s) => [s.studentId, status])
      )
    );

  const setMark = (id: string, status: Status) =>
    setMarks((m) => ({ ...m, [id]: status }));

  async function save() {
    if (period === null) return;

    setBusy(true);
    setNote(null);

    try {
      await markAttendance({
        classId,
        date,
        period,
        records: list.map((s) => ({
          studentId: s.studentId,
          status: marks[s.studentId] ?? "PRESENT",
        })),
      });

      setJustSaved((j) => [...new Set([...j, period])]);

      setNote({
        ok: true,
        text: "Attendance submitted successfully.",
      });
    } catch (e) {
      setNote({
        ok: false,
        text: (e as Error).message,
      });
    } finally {
      setBusy(false);
    }
  }

  const segment = (id: View, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={view === id}
      onClick={() => setView(id)}
      className={`rounded-md px-3 py-1.5 text-sm font-medium ${view === id ? "bg-white shadow-sm" : "text-slate-600"
        }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <p className="mb-3 text-sm">
        <Link
          to="/faculty/classes"
          className="font-medium text-brand-dark hover:underline"
        >
          ‹ Back to classes
        </Link>
      </p>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{cls.data.label}</h2>
          <p className="text-sm text-slate-500">
            {cls.data.subject} · {list.length} students
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Class view"
          className="inline-flex rounded-lg bg-slate-200/70 p-1"
        >
          {segment("update", "Attendance update")}
          {segment("list", "Student list")}
        </div>
      </div>

      {view === "list" ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[480px]">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="th">Roll no.</th>
                <th className="th">Name</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {list.map((s) => (
                <tr key={s.studentId}>
                  <td className="td font-mono text-xs text-slate-500">
                    {s.rollNo}
                  </td>

                  <td className="td font-medium">
                    {s.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <label className="text-sm font-medium">
              Class date
              <input
                type="date"
                className="input mt-1 !w-44"
                value={date}
                max={todayLocal()}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <label className="text-sm font-medium">
              Period
              {teaching.loading ? (
                <p className="mt-1 text-sm font-normal text-slate-500">
                  Loading periods…
                </p>
              ) : (
                <select
                  aria-label="Select period"
                  className="input mt-1 !w-80 max-w-full"
                  value={period ?? ""}
                  onChange={(e) => {
                    setPeriod(Number(e.target.value));
                    setNote(null);
                  }}
                >
                  {others.length === 0 ? (
                    options.map((h) => (
                      <option key={h.period} value={h.period}>
                        {optionText(h)}
                      </option>
                    ))
                  ) : (
                    <>
                      <optgroup label="My periods">
                        {mine.map((h) => (
                          <option key={h.period} value={h.period}>
                            {optionText(h)}
                          </option>
                        ))}
                      </optgroup>

                      <optgroup label="Other periods (substitute / free period)">
                        {others.map((h) => (
                          <option key={h.period} value={h.period}>
                            {optionText(h)}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  )}
                </select>
              )}
            </label>

            <button
              type="button"
              className="btn-ghost"
              onClick={() => setAll("PRESENT")}
            >
              Mark all present
            </button>

            <button
              type="button"
              className="btn-ghost"
              onClick={() => setAll("ABSENT")}
            >
              Mark all absent
            </button>
          </div>

          {teaching.error && (
            <div className="mb-3">
              <ErrorBox message={teaching.error} />
            </div>
          )}

          {selected && selected.own === false && (
            <p className="mb-3 rounded-lg bg-brand-tint px-4 py-2.5 text-sm text-brand-dark">
              You are taking this period as a substitute for{" "}
              {selected.subject}.
            </p>
          )}

          <p
            role="status"
            className="mb-3 rounded-lg bg-slate-100 px-4 py-2.5 text-sm text-slate-600"
          >
            {alreadySaved
              ? "Attendance was already posted for this date and period. The saved attendance is shown below. Change it and submit again to update."
              : "No attendance posted yet for this date and period."}
          </p>

          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {list.map((s) => {
              const present = marks[s.studentId] !== "ABSENT";

              return (
                <li
                  key={s.studentId}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  <span className="w-24 shrink-0 font-mono text-xs text-slate-500">
                    {s.rollNo}
                  </span>

                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {s.name}
                  </span>

                  <div
                    role="group"
                    aria-label={`Attendance for ${s.name}`}
                    className="inline-flex overflow-hidden rounded-lg border border-slate-300 text-xs font-semibold"
                  >
                    <button
                      type="button"
                      aria-pressed={present}
                      onClick={() =>
                        setMark(s.studentId, "PRESENT")
                      }
                      className={`px-3 py-1.5 ${present
                          ? "bg-present text-white"
                          : "bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      Present
                    </button>

                    <button
                      type="button"
                      aria-pressed={!present}
                      onClick={() =>
                        setMark(s.studentId, "ABSENT")
                      }
                      className={`px-3 py-1.5 ${!present
                          ? "bg-red-600 text-white"
                          : "bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      Absent
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {list.length - absent} present · {absent} absent
            </p>

            <button
              onClick={save}
              disabled={
                busy ||
                loadingMarks ||
                period === null ||
                list.length === 0
              }
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {busy
                ? "Submitting…"
                : alreadySaved
                  ? "Update attendance"
                  : "Submit attendance"}
            </button>
          </div>

          {note && (
            <div className="mt-3">
              {note.ok ? (
                <p
                  role="status"
                  className="rounded-lg border border-brand bg-brand-tint px-4 py-2.5 text-sm font-semibold text-brand-dark"
                >
                  ✓ {note.text}
                </p>
              ) : (
                <ErrorBox message={note.text} />
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
