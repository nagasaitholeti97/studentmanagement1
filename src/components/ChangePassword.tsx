import { useState, type FormEvent } from "react";
import { changePassword } from "../api";
import { ErrorBox } from "./ui";

export default function ChangePassword() {
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (next.length < 8) return setMsg({ ok: false, text: "New password must be at least 8 characters." });
    setBusy(true);
    try {
      await changePassword(cur, next);
      setMsg({ ok: true, text: "Password changed." });
      setCur(""); setNext("");
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally { setBusy(false); }
  }

  if (!open) return <button className="btn-ghost" onClick={() => setOpen(true)}>Change password</button>;
  return (
    <form onSubmit={submit} className="mt-2 max-w-sm space-y-3">
      <label className="block text-sm font-medium">Current password
        <input type="password" className="input mt-1" value={cur} onChange={(e) => setCur(e.target.value)} required autoComplete="current-password" />
      </label>
      <label className="block text-sm font-medium">New password
        <input type="password" className="input mt-1" value={next} onChange={(e) => setNext(e.target.value)} required autoComplete="new-password" />
      </label>
      {msg && (msg.ok ? <p role="status" className="text-sm text-present">{msg.text}</p> : <ErrorBox message={msg.text} />)}
      <div className="flex gap-2">
        <button className="btn" disabled={busy}>{busy ? "Saving…" : "Save password"}</button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
