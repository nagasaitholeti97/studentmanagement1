import { useState, type FormEvent, type ReactNode } from "react";
import { updateFacultyContact } from "../../api";
import { useFaculty } from "../../components/FacultyLayout";
import PasswordSteps from "../../components/PasswordSteps";
import { ErrorBox } from "../../components/ui";

const show = (v?: string) => (v && v.trim() ? v : "—");

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold">
        <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-sky-700" />{title}
      </h3>
      <dl className="grid grid-cols-[7.5rem_1fr] items-center gap-x-3 gap-y-3 text-sm">{children}</dl>
    </section>
  );
}
const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <dt className="text-slate-500">{label}</dt>
    <dd className="min-w-0 break-words font-medium">{children}</dd>
  </>
);

export default function FacultyProfilePage() {
  const { profile: f, setProfile } = useFaculty();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(f.phone);
  const [email, setEmail] = useState(f.personalEmail);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function startEdit() { setPhone(f.phone); setEmail(f.personalEmail); setErr(null); setEditing(true); }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      setProfile(await updateFacultyContact({ phone: phone.trim(), personalEmail: email.trim() }));
      setEditing(false);
    } catch (ex) {
      setErr((ex as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <>
      <h2 className="sr-only">Profile</h2>
      <div className="mb-3 flex justify-end">
        {!editing && <button type="button" className="btn-ghost !py-1.5" onClick={startEdit}>Edit contact</button>}
      </div>

      <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
        <Card title="Personal">
          <Row label="Name">{show(f.name)}</Row>
          <Row label="Gender">{show(f.gender)}</Row>
          <Row label="Age">{f.age ? `${f.age} years` : "—"}</Row>
          <Row label="Email">
            {editing ? <input type="email" aria-label="Personal email" className="input !py-1.5" value={email} onChange={(e) => setEmail(e.target.value)} required /> : show(f.personalEmail)}
          </Row>
          <Row label="Phone">
            {editing ? <input type="tel" aria-label="Phone" className="input !py-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} required /> : show(f.phone)}
          </Row>
        </Card>

        <Card title="Professional">
          <Row label="Faculty ID">{show(f.facultyId)}</Row>
          <Row label="Designation">{show(f.designation)}</Row>
          <Row label="Qualification">{show(f.qualification)}</Row>
          <Row label="Experience">{f.experienceYears ? `${f.experienceYears} years` : "—"}</Row>
          <Row label="Department">{show(f.department)}</Row>
          <Row label="Official email">{show(f.email)}</Row>
          <Row label="Subjects">
            {f.subjects?.length ? (
              <span className="flex flex-wrap gap-1.5">
                {f.subjects.map((s) => <span key={s} className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-800">{s}</span>)}
              </span>
            ) : "—"}
          </Row>
        </Card>

        {editing && (
          <div className="md:col-span-2">
            {err && <div className="mb-3"><ErrorBox message={err} /></div>}
            <div className="flex gap-2">
              <button disabled={busy} className="rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60">{busy ? "Saving…" : "Save contact"}</button>
              <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        )}
      </form>

      <div className="mt-4"><PasswordSteps /></div>
    </>
  );
}