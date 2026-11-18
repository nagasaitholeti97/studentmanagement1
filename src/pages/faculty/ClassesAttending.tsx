import { Link } from "react-router-dom";
import { getMyClasses } from "../../api";
import { ErrorBox, Loading } from "../../components/ui";
import { MIN_PERCENT, statusFor, type SubjectStatus } from "../../lib/format";
import { useAsync } from "../../lib/useAsync";

const band = ["bg-sky-700", "bg-sky-800", "bg-sky-900"];
const ordinal = (n: number) => `${n}${["th", "st", "nd", "rd"][n % 100 > 10 && n % 100 < 14 ? 0 : Math.min(n % 10, 4) % 4]}`;
const tone: Record<SubjectStatus, { tag: string; ring: string }> = {
  Good: { tag: "bg-green-50 text-present", ring: "stroke-present" },
  Borderline: { tag: "bg-amber-50 text-warn", ring: "stroke-warn" },
  Shortage: { tag: "bg-red-50 text-absent", ring: "stroke-absent" },
};

function MiniRing({ value, className }: { value: number; className: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90" aria-hidden>
        <circle cx="28" cy="28" r={r} fill="none" strokeWidth="5" className="stroke-slate-200" />
        <circle cx="28" cy="28" r={r} fill="none" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${(Math.min(value, 100) / 100) * c} ${c}`} className={className} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{Math.round(value)}%</span>
    </div>
  );
}

export default function ClassesAttending() {
  const { data, error, loading } = useAsync(getMyClasses);
  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!data?.length) return <p className="text-sm text-slate-500">No classes have been assigned to you yet.</p>;

  return (
    <>
      <h2 className="sr-only">Classes attending</h2>
      <p className="mb-4 text-sm text-slate-600">
        You teach <b className="text-ink">{data[0].subject}</b>. Open a class to take attendance or see its students.
      </p>
      <ul className="grid gap-4 sm:grid-cols-3">
        {data.map((c, i) => {
          const status = c.average !== undefined ? statusFor(c.average) : null;
          return (
            <li key={c.id}>
              <Link to={`/faculty/classes/${c.id}`} className="block overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-green-700 hover:shadow-sm">
                <div className={`${band[i % band.length]} p-4 text-white`}>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">{ordinal(c.year)} year</p>
                  <h3 className="text-lg font-bold">{c.label}</h3>
                  <p className="text-xs text-white/80">{c.studentCount} students</p>
                </div>
                <div className="p-4">
                  {status && c.average !== undefined && (
                    <div className="flex items-center gap-3">
                      <MiniRing value={c.average} className={tone[status].ring} />
                      <div>
                        <p className="font-semibold">Class average</p>
                        <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone[status].tag}`}>{status}</span>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between text-sm">
                    {c.below75 !== undefined ? (
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.below75 ? "bg-red-50 text-absent" : "bg-green-50 text-present"}`}>
                        {c.below75 ? `${c.below75} below ${MIN_PERCENT}%` : `All above ${MIN_PERCENT}%`}
                      </span>
                    ) : <span />}
                    <span className="font-semibold text-green-800">Open class ›</span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}