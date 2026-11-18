import { useState, type FormEvent } from "react";
import { changePassword, verifyPassword } from "../api";
import { ErrorBox } from "./ui";

const LABELS = ["Current password", "New password", "Confirm new password"];

/** "Change it in three short steps": current password, new password, confirm. */
export default function PasswordSteps() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [cur, setCur] = useState("");
    const [next, setNext] = useState("");
    const [again, setAgain] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);

    function close() {
        setOpen(false); setStep(1); setCur(""); setNext(""); setAgain(""); setErr(null); setDone(false);
    }

    async function submit(e: FormEvent) {
        e.preventDefault();
        setErr(null);
        // Step 1 verifies the current password; only a correct one opens step 2.
        if (step === 1) {
            if (!cur) return setErr("Enter your current password.");
            setBusy(true);
            try {
                await verifyPassword(cur);
                setStep(2);
            } catch (ex) {
                setErr((ex as Error).message || "Current password is incorrect.");
                setCur(""); // stay on step 1 so they can retry
            } finally {
                setBusy(false);
            }
            return;
        }
        if (step === 2) {
            if (next.length < 8) return setErr("Use at least 8 characters.");
            if (next === cur) return setErr("The new password must be different from the current one.");
            return setStep(3);
        }
        if (again !== next) return setErr("The two passwords do not match.");
        setBusy(true);
        try {
            await changePassword(cur, next);
            setDone(true);
        } catch (ex) {
            setErr((ex as Error).message);
            setStep(1); // safety net: the server rejected it at the final save
        } finally {
            setBusy(false);
        }
    }

    const value = step === 1 ? cur : step === 2 ? next : again;
    const setValue = step === 1 ? setCur : step === 2 ? setNext : setAgain;

    return (
        <section className="rounded-xl border border-slate-200 bg-white/90 p-5" aria-label="Password">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-bold">Password</h3>
                    <p className="mt-0.5 text-sm text-slate-500">Change it in three short steps.</p>
                </div>
                {!open && (
                    <button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-green-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-900">
                        Change password
                    </button>
                )}
            </div>

            {open && (done ? (
                <div className="mt-4">
                    <p role="status" className="text-sm font-semibold text-present">Your password has been changed.</p>
                    <button type="button" onClick={close} className="btn-ghost mt-3">Done</button>
                </div>
            ) : (
                <form onSubmit={submit} className="mt-4 max-w-sm space-y-3">
                    <div aria-hidden className="flex gap-2">
                        {[1, 2, 3].map((n) => <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-green-700" : "bg-slate-200"}`} />)}
                    </div>
                    <label className="block text-sm font-medium">
                        <span className="text-xs font-semibold text-slate-500">Step {step} of 3</span>
                        <span className="block">{LABELS[step - 1]}</span>
                        <input key={step} type="password" className="input mt-1" value={value} onChange={(e) => setValue(e.target.value)}
                            autoFocus autoComplete={step === 1 ? "current-password" : "new-password"} />
                    </label>
                    {step === 2 && (
                        <p className={`text-xs ${next.length >= 8 ? "text-present" : "text-slate-500"}`}>{next.length >= 8 ? "✓" : "•"} At least 8 characters</p>
                    )}
                    {err && <ErrorBox message={err} />}
                    <div className="flex gap-2">
                        {step > 1 && <button type="button" className="btn-ghost" onClick={() => { setErr(null); setStep(step - 1); }}>Back</button>}
                        <button disabled={busy} className="rounded-lg bg-green-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-900 disabled:opacity-60">
                            {step === 1 ? (busy ? "Checking…" : "Next") : step === 2 ? "Next" : busy ? "Saving…" : "Update password"}
                        </button>
                        <button type="button" className="btn-ghost" onClick={close}>Cancel</button>
                    </div>
                </form>
            ))}
        </section>
    );
}