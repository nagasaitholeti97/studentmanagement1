import type { TeachingPeriod } from "../types";

interface Props {
    periods: TeachingPeriod[];
    value: number | null;
    onChange: (period: number) => void;
    /** optional: returns the time range for a period, e.g. "10:50–11:40" */
    timeOf?: (period: number) => string;
}

export default function PeriodSelect({ periods, value, onChange, timeOf }: Props) {
    return (
        <label className="block max-w-sm">
            <span className="mb-1 block text-sm font-medium text-slate-600">Period</span>
            <select
                className="input"
                value={value ?? ""}
                disabled={periods.length === 0}
                onChange={(e) => onChange(Number(e.target.value))}
            >
                {periods.length === 0 && <option value="">No classes on this day</option>}
                {periods.length > 0 && value === null && <option value="" disabled>Select a period</option>}
                {periods.map((p) => (
                    <option key={p.period} value={p.period}>
                        {`Period ${p.period} · ${p.subject}`}
                        {timeOf ? ` (${timeOf(p.period)})` : ""}
                        {p.saved ? " ✓ saved" : ""}
                    </option>
                ))}
            </select>
        </label>
    );
}