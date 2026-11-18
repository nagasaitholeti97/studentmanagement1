
import { useState } from "react";
import { getCalendar, getExams } from "../../api";
import { ErrorBox, Loading, PageTitle } from "../../components/ui";
import { fmtDate } from "../../lib/format";
import { useAsync } from "../../lib/useAsync";
import type { CalendarEvent, ExamSlot } from "../../types";

type Kind = ExamSlot["type"];

type WeekDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

const KINDS: { id: Kind; label: string; long: string }[] = [
  { id: "MID1", label: "Mid 1", long: "Mid 1 exams" },
  { id: "MID2", label: "Mid 2", long: "Mid 2 exams" },
  { id: "SEMESTER", label: "Semester", long: "Semester exams" },
];

// Demo exam timetable for UI preview.
// Real API data will take priority when available.
const DEMO_EXAMS = [
  // MID 1
  { id: 1, type: "MID1", date: "2026-10-09", subject: "Signals & Systems", code: "ECE204" },
  { id: 2, type: "MID1", date: "2026-10-12", subject: "DSD HDL", code: "ECE228" },
  { id: 3, type: "MID1", date: "2026-10-13", subject: "Advanced Web Programming", code: "ECE205" },
  { id: 4, type: "MID1", date: "2026-10-14", subject: "Electronic Engineering", code: "ECE206" },
  { id: 5, type: "MID1", date: "2026-10-15", subject: "Internet of Things", code: "ECE207" },
  { id: 6, type: "MID1", date: "2026-10-16", subject: "Machine Learning", code: "ECE208" },
  { id: 7, type: "MID1", date: "2026-10-17", subject: "Project Management", code: "ECE209" },

  // MID 2
  { id: 8, type: "MID2", date: "2026-11-30", subject: "Signals & Systems", code: "ECE204" },
  { id: 9, type: "MID2", date: "2026-12-01", subject: "DSD HDL", code: "ECE228" },
  { id: 10, type: "MID2", date: "2026-12-02", subject: "Advanced Web Programming", code: "ECE205" },
  { id: 11, type: "MID2", date: "2026-12-03", subject: "Electronic Engineering", code: "ECE206" },
  { id: 12, type: "MID2", date: "2026-12-04", subject: "Internet of Things", code: "ECE207" },
  { id: 13, type: "MID2", date: "2026-12-05", subject: "Machine Learning", code: "ECE208" },
  { id: 14, type: "MID2", date: "2026-12-07", subject: "Project Management", code: "ECE209" },

  // SEMESTER
  { id: 15, type: "SEMESTER", date: "2026-12-14", subject: "Signals & Systems", code: "ECE204" },
  { id: 16, type: "SEMESTER", date: "2026-12-16", subject: "DSD HDL", code: "ECE228" },
  { id: 17, type: "SEMESTER", date: "2026-12-18", subject: "Advanced Web Programming", code: "ECE205" },
  { id: 18, type: "SEMESTER", date: "2026-12-20", subject: "Electronic Engineering", code: "ECE206" },
  { id: 19, type: "SEMESTER", date: "2026-12-22", subject: "Internet of Things", code: "ECE207" },
  { id: 20, type: "SEMESTER", date: "2026-12-24", subject: "Machine Learning", code: "ECE208" },
  { id: 21, type: "SEMESTER", date: "2026-12-28", subject: "Project Management", code: "ECE209" },
] as unknown as ExamSlot[];

// Weekly class timetable
const WEEK_DAYS: WeekDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const PERIODS = [
  { label: "1st Hour", time: "9:00–9:50 AM" },
  { label: "2nd Hour", time: "9:50–10:40 AM" },
  { label: "3rd Hour", time: "10:40–11:30 AM" },
  { label: "4th Hour", time: "11:30 AM–12:20 PM" },
  { label: "5th Hour", time: "1:10–2:00 PM" },
  { label: "6th Hour", time: "2:00–2:50 PM" },
  { label: "7th Hour", time: "2:50–3:40 PM" },
];

const WEEKLY_TIMETABLE: Record<WeekDay, string[]> = {
  Monday: ["AWP", "EE", "ADICD", "PYTHON", "ADC LAB", "ADC LAB", "DSD HDL"],
  Tuesday: ["EE", "PYTHON", "AWP", "DSD HDL", "Signals & Systems", "ADICD", "ADC LAB"],
  Wednesday: ["ADICD", "AWP", "PYTHON", "EE", "DSD HDL", "Signals & Systems", "ADC LAB"],
  Thursday: ["PYTHON", "DSD HDL", "EE", "AWP", "ADICD", "ADC LAB", "Signals & Systems"],
  Friday: ["Signals & Systems", "ADICD", "AWP", "PYTHON", "EE", "DSD HDL", "ADC LAB"],
  Saturday: ["DSD HDL", "EE", "Signals & Systems", "ADICD", "PYTHON", "AWP", "ADC LAB"],
};

const localToday = () => {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const daysUntil = (date: string) => {
  return Math.round(
    (new Date(`${date}T00:00:00`).getTime() -
      new Date(`${localToday()}T00:00:00`).getTime()) /
    86400000
  );
};

const weekday = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
  });

const isoPlus = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function gapText(
  prev: string,
  date: string,
  holidays: CalendarEvent[]
) {
  const n =
    Math.round(
      (new Date(`${date}T00:00:00`).getTime() -
        new Date(`${prev}T00:00:00`).getTime()) /
      86400000
    ) - 1;

  if (n <= 0) return "Next day";

  const reasons: string[] = [];

  for (let i = 1; i <= n; i++) {
    const d = isoPlus(prev, i);

    if (new Date(`${d}T00:00:00`).getDay() === 0) {
      reasons.push("Sunday");
    } else {
      const holiday = holidays.find(
        (h) => h.start <= d && d <= h.end
      );

      if (holiday) reasons.push(holiday.title);
    }
  }

  return `${n} ${n === 1 ? "day" : "days"}${reasons.length ? ` · ${reasons.join(", ")}` : ""
    }`;
}

const paperStatus = (days: number) => {
  if (days < 0) return "Completed";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
};

const range = (slots: ExamSlot[]) =>
  `${fmtDate(slots[0].date)} – ${fmtDate(slots[slots.length - 1].date)}`;

function groupStatus(slots: ExamSlot[]) {
  if (slots.length === 0) return "Not published";

  if (daysUntil(slots[slots.length - 1].date) < 0) {
    return "Completed";
  }

  if (daysUntil(slots[0].date) > 0) {
    return "Upcoming";
  }

  return "In progress";
}

function subjectStyle(subject: string) {
  switch (subject) {
    case "AWP":
      return "bg-blue-50 text-blue-700";
    case "EE":
      return "bg-green-50 text-green-700";
    case "ADICD":
      return "bg-indigo-50 text-indigo-700";
    case "PYTHON":
      return "bg-amber-50 text-amber-700";
    case "ADC LAB":
      return "bg-purple-50 text-purple-700";
    case "DSD HDL":
      return "bg-cyan-50 text-cyan-700";
    case "Signals & Systems":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function StudentCalendar() {
  const { data, error, loading } = useAsync(getExams);
  const cal = useAsync(getCalendar);

  const [picked, setPicked] = useState<Kind | null>(null);

  if (loading || cal.loading) {
    return <Loading />;
  }

  if (error || cal.error) {
    return (
      <ErrorBox
        message={error ?? cal.error ?? "Could not load the schedule."}
      />
    );
  }

  const holidays = (cal.data ?? []).filter(
    (event) => event.type === "HOLIDAY"
  );

  // Use API data when available; otherwise use demo data.
  const all: ExamSlot[] = [
    ...(data?.length ? data : DEMO_EXAMS),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const by = (kind: Kind) =>
    all.filter((exam) => exam.type === kind);

  const next = all.find((exam) => daysUntil(exam.date) >= 0);

  const active: Kind = picked ?? next?.type ?? "MID1";
  const list = by(active);

  const activeName =
    KINDS.find((kind) => kind.id === active)?.long ?? "Exam";

  return (
    <>
      <PageTitle sub="View your weekly classes and upcoming examination schedule.">
        Academic calendar
      </PageTitle>

      {/* WEEKLY CLASS TIMETABLE */}
      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Weekly Class Timetable
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Monday to Saturday · 1st to 7th hour
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            Weekly Schedule
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                  Day
                </th>

                {PERIODS.map((period) => (
                  <th
                    key={period.label}
                    className="border-b border-slate-200 px-3 py-3 text-center"
                  >
                    <div className="text-sm font-bold text-slate-700">
                      {period.label}
                    </div>

                    <div className="mt-1 whitespace-nowrap text-xs font-normal text-slate-500">
                      {period.time}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {WEEK_DAYS.map((day) => (
                <tr key={day} className="hover:bg-slate-50">
                  <th
                    scope="row"
                    className="whitespace-nowrap px-4 py-4 text-sm font-bold text-slate-800"
                  >
                    {day}
                  </th>

                  {WEEKLY_TIMETABLE[day].map((subject, index) => (
                    <td
                      key={`${day}-${index}`}
                      className="min-w-[125px] px-2 py-3 text-center"
                    >
                      <span
                        className={`block rounded-lg px-2 py-3 text-xs font-semibold ${subjectStyle(subject)}`}
                      >
                        {subject}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Lunch Break: 12:20 PM – 1:10 PM
        </div>

        <p className="mt-2 text-xs text-slate-400">
          Sample weekly timetable. Confirm actual subjects and timings with your college.
        </p>
      </section>

      {/* NEXT EXAM BANNER */}
      {next && (
        <section
          aria-label="Next exam"
          className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
              Next exam ·{" "}
              {KINDS.find((kind) => kind.id === next.type)?.label}
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {next.subject}
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {weekday(next.date)}, {fmtDate(next.date)}
            </p>
          </div>

          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
            {paperStatus(daysUntil(next.date))}
          </span>
        </section>
      )}

      {/* EXAM SELECTION CARDS */}
      <div
        role="group"
        aria-label="Choose an exam"
        className="mb-6 grid gap-3 sm:grid-cols-3"
      >
        {KINDS.map((kind) => {
          const slots = by(kind.id);
          const selected = active === kind.id;
          const status = groupStatus(slots);

          return (
            <button
              key={kind.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setPicked(kind.id)}
              className={`rounded-xl border bg-white p-4 text-left shadow-sm transition hover:border-blue-500 ${selected
                ? "border-blue-600 ring-2 ring-blue-500"
                : "border-slate-200"
                }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-lg font-bold text-slate-900">
                  {kind.label}
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : status === "Upcoming"
                      ? "bg-blue-100 text-blue-700"
                      : status === "In progress"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                >
                  {status}
                </span>
              </span>

              <span className="mt-2 block text-sm text-slate-500">
                {slots.length
                  ? range(slots)
                  : "Schedule not published yet"}
              </span>

              {slots.length > 0 && (
                <span className="mt-1 block text-xs text-slate-400">
                  {slots.length} papers
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SELECTED EXAM SCHEDULE */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">
          {activeName} schedule
        </h3>

        {list.length > 0 && (
          <span className="text-xs text-slate-500">
            {list.length} papers
          </span>
        )}
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm text-slate-500">
            The {activeName.toLowerCase()} schedule has not been published yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <caption className="sr-only">
              {activeName} schedule
            </caption>

            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-xs font-bold text-slate-600">
                  No.
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold text-slate-600">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold text-slate-600">
                  Day
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold text-slate-600">
                  Subject
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold text-slate-600">
                  Gap since previous paper
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold text-slate-600">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {list.map((exam, index) => {
                const days = daysUntil(exam.date);

                return (
                  <tr
                    key={`${exam.type}-${exam.id}`}
                    className={days < 0 ? "text-slate-400" : ""}
                  >
                    <td className="px-4 py-4 text-sm">
                      {index + 1}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                      {fmtDate(exam.date)}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {weekday(exam.date)}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      <span className="font-medium">
                        {exam.subject}
                      </span>

                      {exam.code && (
                        <span className="block text-xs text-slate-500">
                          {exam.code}
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                      {index === 0
                        ? "—"
                        : gapText(
                          list[index - 1].date,
                          exam.date,
                          holidays
                        )}
                    </td>

                    <td
                      className={`whitespace-nowrap px-4 py-4 text-sm ${days >= 0 && days <= 1
                        ? "font-semibold text-blue-700"
                        : ""
                        }`}
                    >
                      {paperStatus(days)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Papers are never held on Sundays or public holidays.
        Semester exams leave one free day between papers.
      </p>
    </>
  );
}
