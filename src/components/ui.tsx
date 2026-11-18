import type { ReactNode } from "react";
import { MIN_PERCENT } from "../lib/format";

export const PageTitle = ({ children, sub }: { children: ReactNode; sub?: string }) => (
  <div className="mb-5">
    <h2 className="text-2xl font-bold">{children}</h2>
    {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
  </div>
);

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <p role="status" className="py-10 text-center text-sm text-slate-500">{label}</p>;
}

export function ErrorBox({ message }: { message: string }) {
  return <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-absent">{message}</p>;
}

export function PercentBadge({ value }: { value: number }) {
  const low = value < MIN_PERCENT;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${low ? "bg-red-50 text-absent" : "bg-green-50 text-present"}`}>
      {value}%
    </span>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="mb-4 inline-flex rounded-lg bg-slate-200/70 p-1">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium ${value === t.id ? "bg-white shadow-sm" : "text-slate-600"}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs text-slate-500">{label}</dt>
    <dd className="mt-0.5 text-sm font-medium">{value}</dd>
  </div>
);
