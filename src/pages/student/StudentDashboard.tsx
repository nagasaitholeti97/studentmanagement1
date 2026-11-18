import { getAttendanceReport, getRegister, getStudentProfile } from "../../api";
import CollegeBanner from "../../components/CollegeBanner";
import { ErrorBox, Loading, PageTitle, PercentBadge } from "../../components/ui";
import { MIN_PERCENT, pct } from "../../lib/format";
import { useAsync } from "../../lib/useAsync";

// Defined outside the component so the reference stays stable between renders
const fetchTillNow = () => getAttendanceReport({ type: "till-now" });

// Local date as YYYY-MM-DD (toISOString() would give the UTC date)
function localToday() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const chip: Record<string, string> = {
  PRESENT: "bg-green-50 text-present",
  ABSENT: "bg-yellow-100 text-black",
  NOT_ENTERED: "bg-slate-100 text-slate-500",
  NO_CLASS_WORK: "bg-purple-100 text-purple-800",
};
const chipLabel: Record<string, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  NOT_ENTERED: "Not entered yet",
  NO_CLASS_WORK: "No class work",
};

export default function StudentDashboard() {
  const profile = useAsync(getStudentProfile);
  const att = useAsync(fetchTillNow);
  const reg = useAsync(getRegister);

  if (profile.loading || att.loading || reg.loading) return <Loading />;
  if (profile.error || att.error || !profile.data) {
    return <ErrorBox message={profile.error ?? att.error ?? "Something went wrong."} />;
  }

  const rows = att.data?.rows ?? [];
  const held = rows.reduce((n, r) => n + r.held, 0);
  const attended = rows.reduce((n, r) => n + r.attended, 0);

  const today = localToday();
  const todayRow = reg.data?.days.find((d) => d.date === today);

  const meetsMin = attended * 100 >= MIN_PERCENT * held;
  const mustAttend = Math.max(0, Math.ceil((MIN_PERCENT * held - 100 * attended) / (100 - MIN_PERCENT)));
  const canMiss = Math.max(0, Math.floor((100 * attended - MIN_PERCENT * held) / MIN_PERCENT));

  const advice =
    held === 0
      ? "No classes have been held yet."
      : meetsMin
        ? `You can miss ${canMiss} more ${canMiss === 1 ? "class" : "classes"} and stay at ${MIN_PERCENT}% or above.`
        : `Attend the next ${mustAttend} ${mustAttend === 1 ? "class" : "classes"} in a row to reach ${MIN_PERCENT}%.`;

  return (
    <>
      <CollegeBanner />

      {/* Name shown once */}
      <PageTitle sub={`${profile.data.rollNo} · ${profile.data.year}, ${profile.data.section}`}>
        Hello, {profile.data.name.split(" ")[0]}
      </PageTitle>

      <div className="card mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Attendance till now</p>
            <p className="text-sm">{attended} of {held} classes attended</p>
          </div>
          <PercentBadge value={pct(attended, held)} />
        </div>
        <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">{advice}</p>
      </div>

      <section className="card mb-4">
        <h3 className="text-sm font-semibold">Today's classes</h3>
        {reg.error ? (
          <p className="mt-3 text-sm text-red-600">Couldn't load today's classes.</p>
        ) : !todayRow ? (
          <p className="mt-3 text-sm text-slate-500">No classes are recorded for today.</p>
        ) : todayRow.holiday ? (
          <p className="mt-3 text-sm text-slate-500">Today is a holiday.</p>
        ) : todayRow.cells.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No classes scheduled today.</p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {todayRow.cells.map((c) => (
              <li key={c.period} className={`rounded-lg px-3 py-2 text-xs ${chip[c.status] ?? ""}`}>
                <span className="block text-[11px] opacity-70">Hour {c.period}</span>
                <span className="block font-semibold">{c.subject}</span>
                <span className="block">{chipLabel[c.status] ?? c.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}