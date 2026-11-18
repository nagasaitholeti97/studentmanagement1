import { getCalendar } from "../api";
import { fmtDate } from "../lib/format";
import { useAsync } from "../lib/useAsync";
import { ErrorBox, Loading } from "./ui";

const tone = { HOLIDAY: "bg-green-50 text-present", EXAM: "bg-red-50 text-absent", EVENT: "bg-brand-tint text-brand-dark" } as const;

export default function CalendarList() {
  const { data, error, loading } = useAsync(getCalendar);
  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!data?.length) return <p className="text-sm text-slate-500">No events have been added to the academic calendar yet.</p>;
  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {[...data].sort((a, b) => a.start.localeCompare(b.start)).map((e) => (
        <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
          <div>
            <p className="text-sm font-semibold">{e.title}</p>
            <p className="text-xs text-slate-500">{e.start === e.end ? fmtDate(e.start) : `${fmtDate(e.start)} – ${fmtDate(e.end)}`}</p>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone[e.type]}`}>
            {e.type === "HOLIDAY" ? "Holiday" : e.type === "EXAM" ? "Exam" : "Event"}
          </span>
        </li>
      ))}
    </ul>
  );
}
