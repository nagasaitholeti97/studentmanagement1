
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getAttendanceReport, getRegister } from "../../api";
import { ErrorBox, Loading, PageTitle, PercentBadge } from "../../components/ui";
import {
  adviceFor,
  MIN_PERCENT,
  monthKey,
  monthLabel,
  pct,
  pct2,
  statusFor,
  type SubjectStatus,
} from "../../lib/format";
import { useAsync } from "../../lib/useAsync";
import type { RegisterStatus } from "../../types";

/* ---------------------------------- helpers ---------------------------------- */

const tone: Record<SubjectStatus, { tag: string; ring: string; bar: string }> = {
  Good: {
    tag: "bg-green-50 text-present",
    ring: "stroke-present",
    bar: "bg-present",
  },
  Borderline: {
    tag: "bg-amber-50 text-warn",
    ring: "stroke-warn",
    bar: "bg-warn",
  },
  Shortage: {
    tag: "bg-red-50 text-absent",
    ring: "stroke-absent",
    bar: "bg-absent",
  },
};

const cellTone: Record<
  RegisterStatus,
  { box: string; chip: string; label: string }
> = {
  PRESENT: {
    box: "",
    chip: "bg-green-50 text-present",
    label: "Present",
  },
  ABSENT: {
    box: "bg-red-50 ring-1 ring-inset ring-red-200",
    chip: "bg-red-100 text-absent",
    label: "Absent",
  },
  NOT_ENTERED: {
    box: "",
    chip: "bg-slate-100 text-slate-500",
    label: "Not entered",
  },
  NO_CLASS_WORK: {
    box: "bg-purple-50",
    chip: "bg-purple-100 text-purple-800",
    label: "No class work",
  },
};

const monthShort = (key: string) =>
  new Date(key + "-01T00:00:00").toLocaleDateString("en-IN", {
    month: "short",
  });

const monthChip = (key: string) =>
  new Date(key + "-01T00:00:00").toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

const dayLabel = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

interface Tally {
  held: number;
  attended: number;
}

/* false on first paint, true right after, so bars can grow in */
function useMounted() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return ready;
}

/* ---------------------------------- small pieces ---------------------------------- */

function Stat({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="card">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-1.5 text-xl font-bold">{children}</div>
    </div>
  );
}

function Ring({
  value,
  className,
}: {
  value: number;
  className: string;
}) {
  const ready = useMounted();
  const r = 34;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg
        viewBox="0 0 80 80"
        className="h-20 w-20 -rotate-90"
        aria-hidden
      >
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="7"
          className="stroke-slate-200"
        />

        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${ready ? (Math.min(value, 100) / 100) * c : 0} ${c}`}
          className={`${className} transition-all duration-700`}
        />
      </svg>

      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
        {Math.round(value)}%
      </span>
    </div>
  );
}

/* ---------------------------------- charts ---------------------------------- */

function MonthChart({
  data,
  selected,
  onSelect,
}: {
  data: (Tally & { key: string })[];
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  const ready = useMounted();

  if (data.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center rounded-lg bg-slate-50">
        <p className="text-sm text-slate-500">
          No monthly attendance data available yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-44">
        <div
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-slate-400"
          style={{ bottom: `${MIN_PERCENT}%` }}
        >
          <span className="absolute -top-2 right-0 bg-white px-1 text-[10px] text-slate-500">
            {MIN_PERCENT}%
          </span>
        </div>

        <div className="flex h-full items-end gap-3">
          {data.map((d) => {
            const v = pct2(d.attended, d.held);
            const t = tone[statusFor(v)];
            const dim = selected !== null && selected !== d.key;

            return (
              <button
                key={d.key}
                type="button"
                aria-pressed={selected === d.key}
                onClick={() => onSelect(d.key)}
                aria-label={`${monthLabel(d.key)}: ${v.toFixed(1)}%, ${d.attended} of ${d.held} classes`}
                className="group relative flex h-full flex-1 items-end justify-center rounded-t-md focus-visible:outline-brand"
              >
                <span
                  className={`w-full max-w-[56px] rounded-t-md transition-all duration-500 group-hover:brightness-110 ${t.bar} ${dim ? "opacity-30" : ""}`}
                  style={{
                    height:
                      ready && d.held > 0
                        ? `${Math.max(v, 2)}%`
                        : "0%",
                  }}
                />

                <span
                  className="pointer-events-none absolute left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-xs text-white shadow group-hover:block group-focus-visible:block"
                  style={{
                    bottom: `calc(${d.held > 0 ? v : 0}% + 8px)`,
                  }}
                >
                  <b>{monthLabel(d.key)}</b>
                  <br />
                  {d.held
                    ? `${v.toFixed(1)}% · ${d.attended} of ${d.held} classes`
                    : "No classes"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex gap-3 border-t border-slate-200 pt-2">
        {data.map((d) => (
          <p
            key={d.key}
            className={`flex-1 text-center text-xs ${selected === d.key
              ? "font-bold text-brand"
              : "text-slate-500"
              }`}
          >
            {monthShort(d.key)}
            <span className="block font-semibold text-slate-700">
              {d.held
                ? `${Math.round(pct2(d.attended, d.held))}%`
                : "–"}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

function SubjectChart({
  data,
  selected,
  onSelect,
}: {
  data: (Tally & { subject: string })[];
  selected: string | null;
  onSelect: (subject: string) => void;
}) {
  const ready = useMounted();

  if (data.length === 0) {
    return (
      <div className="flex min-h-44 items-center justify-center rounded-lg bg-slate-50">
        <p className="text-sm text-slate-500">
          No subject attendance data available yet.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {data.map((d) => {
        const v = pct2(d.attended, d.held);
        const t = tone[statusFor(v)];
        const on = selected === d.subject;

        return (
          <li key={d.subject}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(d.subject)}
              title={`${d.subject}: ${v.toFixed(1)}% (${d.attended} of ${d.held})`}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition ${on
                ? "bg-brand-tint ring-1 ring-brand"
                : "hover:bg-slate-50"
                } ${selected && !on ? "opacity-60" : ""}`}
            >
              <span className="w-28 shrink-0 truncate text-sm sm:w-36">
                {d.subject}
              </span>

              <span className="relative h-3 flex-1 rounded-full bg-slate-200">
                <span
                  className={`block h-3 rounded-full transition-all duration-500 ${t.bar}`}
                  style={{
                    width: ready ? `${Math.min(v, 100)}%` : "0%",
                  }}
                />

                <span
                  aria-hidden
                  className="absolute -top-1 h-5 w-0.5 bg-slate-500"
                  style={{ left: `${MIN_PERCENT}%` }}
                />
              </span>

              <span className="w-24 shrink-0 text-right text-xs text-slate-600">
                {d.held ? (
                  <>
                    <b className="text-slate-800">{Math.round(v)}%</b>
                    {" · "}
                    {d.attended}/{d.held}
                  </>
                ) : (
                  "No classes"
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------------------------- subject card ---------------------------------- */

function SubjectCard({
  name,
  code,
  faculty,
  held,
  attended,
}: {
  name: string;
  code?: string;
  faculty?: string;
} & Tally) {
  const value = pct2(attended, held);
  const status = statusFor(value);
  const t = tone[status];
  const { canMiss, mustAttend } = adviceFor(attended, held);
  const subtitle = [code, faculty].filter(Boolean).join(" · ");

  let advice: string;

  if (held === 0) {
    advice = "No classes held in this period.";
  } else if (value < MIN_PERCENT) {
    advice = `Attend the next ${mustAttend} in a row to reach ${MIN_PERCENT}%`;
  } else if (canMiss > 0) {
    advice = `You can miss ${canMiss} more and stay at ${MIN_PERCENT}%`;
  } else {
    advice = `You are right at ${MIN_PERCENT}%. Missing the next class takes you below it.`;
  }

  return (
    <li className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{name}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        {held > 0 && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${t.tag}`}
          >
            {status}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Ring value={value} className={t.ring} />

        <div>
          <p className="text-xl font-bold">
            {attended} of {held}
          </p>
          <p className="text-sm text-slate-500">classes attended</p>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        aria-label={`${name} attendance, minimum ${MIN_PERCENT}%`}
        className="relative mt-4 h-2 rounded-full bg-slate-200"
      >
        <div
          className={`h-2 rounded-full ${t.bar}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />

        <span
          aria-hidden
          className="absolute -top-1 h-4 w-0.5 bg-slate-500"
          style={{ left: `${MIN_PERCENT}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-slate-600">{advice}</p>
    </li>
  );
}

/* ---------------------------------- the page ---------------------------------- */

const PAGE = 15;

export default function StudentAttendance() {
  const reg = useAsync(getRegister);
  const rep = useAsync(() =>
    getAttendanceReport({ type: "till-now" })
  );

  const [month, setMonthRaw] = useState<string | null>(null);
  const [subject, setSubjectRaw] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);

  const setMonth = (m: string | null) => {
    setMonthRaw(m);
    setShown(PAGE);
  };

  const setSubject = (s: string | null) => {
    setSubjectRaw(s);
    setShown(PAGE);
  };

  const days = useMemo(
    () => reg.data?.days ?? [],
    [reg.data]
  );

  const meta = useMemo(
    () =>
      new Map(
        (rep.data?.rows ?? []).map((r) => [r.subject, r])
      ),
    [rep.data]
  );

  const subjects = useMemo(() => {
    const names = new Set<string>(
      (rep.data?.rows ?? []).map((r) => r.subject)
    );

    days.forEach((d) =>
      d.cells.forEach((c) => names.add(c.subject))
    );

    return [...names];
  }, [rep.data, days]);


  // Semester period: November 3, 2026 through March 18, 2027.
  // Include every calendar month touched by the semester, even if no
  // attendance has been recorded in that month yet.
  const months = useMemo(() => {
    const start = new Date(2026, 10, 1); // November 2026
    const end = new Date(2027, 2, 1);    // March 2027
    const semesterMonths: string[] = [];

    for (
      const current = new Date(start);
      current <= end;
      current.setMonth(current.getMonth() + 1)
    ) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      semesterMonths.push(`${year}-${month}`);
    }

    return semesterMonths;
  }, []);


  // Only PRESENT and ABSENT records count toward attendance
  const records = useMemo(
    () =>
      days.flatMap((d) =>
        d.holiday
          ? []
          : d.cells
            .filter(
              (c) =>
                c.status === "PRESENT" ||
                c.status === "ABSENT"
            )
            .map((c) => ({
              month: monthKey(d.date),
              subject: c.subject,
              present: c.status === "PRESENT",
            }))
      ),
    [days]
  );

  // Month chart follows the subject filter
  const byMonth = useMemo(
    () =>
      months.map((m) => {
        const t: Tally = { held: 0, attended: 0 };

        for (const r of records) {
          if (r.month === m && (!subject || r.subject === subject)) {
            t.held++;
            if (r.present) t.attended++;
          }
        }

        return { key: m, ...t };
      }),
    [months, records, subject]
  );

  // Subject chart and cards follow the month filter
  const bySubject = useMemo(
    () =>
      subjects.map((s) => {
        const t: Tally = { held: 0, attended: 0 };

        for (const r of records) {
          if (r.subject === s && (!month || r.month === month)) {
            t.held++;
            if (r.present) t.attended++;
          }
        }

        return { subject: s, ...t };
      }),
    [subjects, records, month]
  );

  const inScope = bySubject.filter(
    (s) => !subject || s.subject === subject
  );

  const held = inScope.reduce((n, s) => n + s.held, 0);
  const attended = inScope.reduce((n, s) => n + s.attended, 0);

  const below = bySubject.filter(
    (s) =>
      s.held > 0 &&
      pct2(s.attended, s.held) < MIN_PERCENT
  ).length;

  const tableDays = useMemo(
    () =>
      days
        .filter(
          (d) =>
            (!month || monthKey(d.date) === month) &&
            (d.holiday
              ? !subject
              : !subject ||
              d.cells.some((c) => c.subject === subject))
        )
        .slice()
        .reverse(),
    [days, month, subject]
  );

  if (reg.loading || rep.loading) {
    return <Loading />;
  }

  if (reg.error || rep.error) {
    return (
      <ErrorBox
        message={
          reg.error ??
          rep.error ??
          "Attendance not available."
        }
      />
    );
  }

  // IMPORTANT: Do not return early when there are no attendance days.
  // The dashboard layout should still be displayed with real zero values.

  const hours = Math.max(
    7,
    ...days.map((d) => d.cells.length)
  );

  const filtered = month !== null || subject !== null;

  const scope = `${month ? monthLabel(month) : "All months"
    } · ${subject ?? "All subjects"}`;

  const cards = bySubject.filter(
    (s) => !subject || s.subject === subject
  );

  return (
    <>
      <PageTitle sub={`A subject below ${MIN_PERCENT}% is marked Shortage.`}>
        Attendance
      </PageTitle>

      {/* Filters */}
      <section
        aria-label="Filters"
        className="card mb-4 space-y-3"
      >
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            Month

            <select
              className="input !w-56 font-normal"
              value={month ?? ""}
              onChange={(e) =>
                setMonth(e.target.value || null)
              }
            >
              <option value="">All months</option>

              {months.map((m) => (
                <option key={m} value={m}>
                  {monthChip(m)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            Subject

            <select
              className="input !w-56 font-normal"
              value={subject ?? ""}
              onChange={(e) =>
                setSubject(e.target.value || null)
              }
            >
              <option value="">All subjects</option>

              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>
            Showing:{" "}
            <b className="text-slate-700">{scope}</b>
          </span>

          {filtered && (
            <button
              type="button"
              className="btn-ghost !px-3 !py-1.5"
              onClick={() => {
                setMonth(null);
                setSubject(null);
              }}
            >
              Reset
            </button>
          )}
        </div>
      </section>

      {/* Summary */}
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Stat label="Attendance">
          <PercentBadge value={pct(attended, held)} />
        </Stat>

        <Stat label="Classes attended">
          {attended}
          <span className="text-base font-medium text-slate-500">
            {" "}of {held}
          </span>
        </Stat>

        <Stat label={`Subjects below ${MIN_PERCENT}%`}>
          <span className={below ? "text-absent" : "text-present"}>
            {below}
          </span>
        </Stat>
      </div>

      {/* Graphs */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <section
          className="card"
          aria-label="Month by month"
        >
          <h3 className="text-sm font-semibold">
            Month by month
          </h3>

          <p className="mb-4 mt-0.5 text-xs text-slate-500">
            {subject ? `${subject} only. ` : ""}
            Click a bar to filter by that month.
          </p>

          <MonthChart
            data={byMonth}
            selected={month}
            onSelect={(m) =>
              setMonth(month === m ? null : m)
            }
          />
        </section>

        <section
          className="card"
          aria-label="Subject by subject"
        >
          <h3 className="text-sm font-semibold">
            Subject by subject
          </h3>

          <p className="mb-3 mt-0.5 text-xs text-slate-500">
            {month ? `${monthLabel(month)}. ` : ""}
            Click a subject to filter by it.
          </p>

          <SubjectChart
            data={bySubject}
            selected={subject}
            onSelect={(s) =>
              setSubject(subject === s ? null : s)
            }
          />
        </section>
      </div>

      {/* By subject cards */}
      <h3 className="mb-3 text-sm font-semibold text-slate-600">
        By subject
      </h3>

      {cards.length === 0 ? (
        <div className="card mb-8 py-8 text-center">
          <p className="text-sm font-medium text-slate-600">
            No subject attendance records available yet.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Subject attendance will appear here after faculty records attendance.
          </p>
        </div>
      ) : (
        <ul className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((s) => (
            <SubjectCard
              key={s.subject}
              name={s.subject}
              code={meta.get(s.subject)?.code}
              faculty={meta.get(s.subject)?.faculty}
              held={s.held}
              attended={s.attended}
            />
          ))}
        </ul>
      )}

      {/* Hourly record */}
      <section aria-label="Hourly record">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-600">
            Hourly record
          </h3>

          <p className="text-xs text-slate-500">
            Newest first · {scope}
          </p>
        </div>

        {tableDays.length === 0 ? (
          <div className="card py-6 text-center">
            <p className="text-sm text-slate-500">
              No attendance has been recorded yet.
            </p>
          </div>
        ) : (
          <>
            <div className="max-h-[32rem] overflow-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead className="sticky top-0 z-10 bg-slate-100">
                  <tr>
                    <th
                      scope="col"
                      className="sticky left-0 bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-500"
                    >
                      Date
                    </th>

                    {Array.from({ length: hours }, (_, i) => (
                      <th
                        key={i}
                        scope="col"
                        className="px-3 py-2.5 text-xs font-semibold text-slate-500"
                      >
                        {i + 1} Hour
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {tableDays.slice(0, shown).map((d) => (
                    <tr
                      key={d.date}
                      className="border-t border-slate-100"
                    >
                      <th
                        scope="row"
                        className="sticky left-0 whitespace-nowrap bg-white px-3 py-2 text-sm font-medium"
                      >
                        {dayLabel(d.date)}
                      </th>

                      {d.holiday ? (
                        <td
                          colSpan={hours}
                          className="bg-sky-50 px-3 py-2 text-xs font-semibold text-present"
                        >
                          Holiday
                        </td>
                      ) : (
                        Array.from({ length: hours }, (_, i) => {
                          const c = d.cells.find(
                            (x) => x.period === i + 1
                          );

                          if (
                            !c ||
                            (subject && c.subject !== subject)
                          ) {
                            return (
                              <td
                                key={i}
                                className="px-3 py-2 text-center text-slate-300"
                              >
                                –
                              </td>
                            );
                          }

                          const ct = cellTone[c.status];

                          return (
                            <td
                              key={i}
                              className={`px-3 py-2 align-top ${ct.box}`}
                            >
                              <p className="text-sm">
                                {c.subject}
                              </p>

                              <span
                                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${ct.chip}`}
                              >
                                {ct.label}
                              </span>
                            </td>
                          );
                        })
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {Math.min(shown, tableDays.length)} of{" "}
                {tableDays.length} days
              </span>

              {shown < tableDays.length && (
                <button
                  type="button"
                  className="btn-ghost !py-1.5"
                  onClick={() => setShown(shown + PAGE)}
                >
                  Show{" "}
                  {Math.min(PAGE, tableDays.length - shown)} more
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}
