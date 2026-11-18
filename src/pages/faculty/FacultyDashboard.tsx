import { Link } from "react-router-dom";
import { getFacultyProfile, getMyClasses, getMyTeachingPeriods } from "../../api";
import CollegeBanner from "../../components/CollegeBanner";
import { ErrorBox, Loading, PageTitle } from "../../components/ui";
import { periodTime, todayLocal } from "../../lib/periods";
import { useAsync } from "../../lib/useAsync";

export default function FacultyDashboard() {
  const profile = useAsync(getFacultyProfile);
  // only the hours this faculty member teaches today (own subject), across all of their classes
  const today = useAsync(async () => {
    const date = todayLocal();
    const classes = await getMyClasses();
    const rows = await Promise.all(
      classes.map(async (c) => (await getMyTeachingPeriods(c.id, date)).map((h) => ({ classId: c.id, label: c.label, ...h }))),
    );
    return rows.flat().sort((a, b) => a.period - b.period);
  });

  if (profile.loading || today.loading) return <Loading />;
  if (profile.error || !profile.data) return <ErrorBox message={profile.error ?? "Something went wrong."} />;

  const f = profile.data;
  const slots = today.data ?? [];

  return (
    <>
      <CollegeBanner />
      <PageTitle sub={`${f.facultyId} · ${f.designation}, ${f.department}`}>Hello, {f.name}</PageTitle>

      <section className="card mb-4">
        <h3 className="text-sm font-semibold">Today's classes</h3>
        {today.error ? (
          <p className="mt-3 text-sm text-slate-500">{today.error}</p>
        ) : slots.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">You have no classes scheduled today.</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((s) => (
              <li key={`${s.classId}-${s.period}`}>
                <Link to={`/faculty/classes/${s.classId}`} className="block rounded-lg bg-slate-50 px-3 py-2.5 text-xs transition hover:bg-brand-tint">
                  <span className="block text-[11px] text-slate-500">Period {s.period}{periodTime(s.period) ? ` · ${periodTime(s.period)}` : ""}</span>
                  <span className="block text-sm font-semibold">{s.label}</span>
                  <span className="block text-slate-500">{s.subject}</span>
                  <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 font-semibold ${s.saved ? "bg-green-50 text-present" : "bg-slate-200 text-slate-600"}`}>
                    {s.saved ? "Attendance saved" : "Attendance not taken yet"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm">
        <Link to="/faculty/classes" className="font-medium text-brand hover:underline">See all your classes</Link>
      </p>
    </>
  );
}