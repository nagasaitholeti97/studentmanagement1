import type { Status } from "../types";

interface Props {
    value: Status;
    onChange: (s: Status) => void;
    studentName: string;
}

export default function StatusToggle({ value, onChange, studentName }: Props) {
    const base = "px-3 py-1.5 text-xs font-semibold transition";
    return (
        <div
            role="group"
            aria-label={`Attendance for ${studentName}`}
            className="inline-flex overflow-hidden rounded-lg border border-slate-300"
        >
            <button
                type="button"
                aria-pressed={value === "PRESENT"}
                onClick={() => onChange("PRESENT")}
                className={`${base} ${value === "PRESENT" ? "bg-present text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
                Present
            </button>
            <button
                type="button"
                aria-pressed={value === "ABSENT"}
                onClick={() => onChange("ABSENT")}
                className={`${base} border-l border-slate-300 ${value === "ABSENT" ? "bg-absent text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
                Absent
            </button>
        </div>
    );
}