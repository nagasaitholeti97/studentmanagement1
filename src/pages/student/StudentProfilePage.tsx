
import type { ReactNode } from "react";
import { getStudentProfile } from "../../api";
import PasswordSteps from "../../components/PasswordSteps";
import { Detail, ErrorBox, Loading, PageTitle } from "../../components/ui";
import { fmtDate } from "../../lib/format";
import { useAsync } from "../../lib/useAsync";

const show = (v?: string) => (v && v.trim() ? v : "—");

const STUDENT_DETAILS: Record<
  string,
  { department: string; section: string }
> = {
  "student1@college.edu": { department: "ECE", section: "A" },
  "student2@college.edu": { department: "ECE", section: "B" },
  "student3@college.edu": { department: "ECE", section: "C" },
};

function ageFrom(iso: string) {
  const b = new Date(iso + "T00:00:00");
  const n = new Date();

  let age = n.getFullYear() - b.getFullYear();

  if (
    n.getMonth() < b.getMonth() ||
    (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())
  ) {
    age--;
  }

  return age;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="card mb-4">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </dl>
    </section>
  );
}

export default function StudentProfilePage() {
  const { data: s, error, loading } = useAsync(getStudentProfile);

  if (loading) return <Loading />;

  if (error || !s) {
    return <ErrorBox message={error ?? "Profile not found."} />;
  }

  const email = s.email?.trim().toLowerCase() ?? "";

  const studentDetails = STUDENT_DETAILS[email];

  const department = studentDetails?.department ?? show(s.department);
  const section = studentDetails?.section ?? show(s.section);

  const initials = s.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <PageTitle>Profile</PageTitle>

      {/* STUDENT HEADER */}
      <div className="card mb-4 flex items-center gap-4">
        <div
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint text-lg font-bold text-brand-dark"
        >
          {initials}
        </div>

        <div>
          <p className="text-lg font-bold">{s.name}</p>

          <p className="text-sm text-slate-500">
            {s.rollNo} · {s.course}, {s.year} · {section}
          </p>
        </div>
      </div>

      {/* PERSONAL DETAILS */}
      <Section title="Personal details">
        <Detail label="Full name" value={show(s.name)} />
        <Detail label="Gender" value={show(s.gender)} />

        <Detail
          label="Date of birth"
          value={
            s.dateOfBirth
              ? `${fmtDate(s.dateOfBirth)} (${ageFrom(s.dateOfBirth)} years)`
              : "—"
          }
        />
      </Section>

      {/* PARENTS */}
      <Section title="Parents">
        <Detail label="Father's name" value={show(s.fatherName)} />
        <Detail label="Mother's name" value={show(s.motherName)} />
        <Detail
          label="Parent contact number"
          value={show(s.parentPhone)}
        />
      </Section>

      {/* CONTACT AND ADDRESS */}
      <Section title="Contact and address">
        <Detail label="Phone number" value={show(s.phone)} />
        <Detail label="Email" value={show(s.email)} />
        <Detail label="Personal email" value={show(s.personalEmail)} />

        <div className="sm:col-span-2 lg:col-span-3">
          <Detail label="Address" value={show(s.address)} />
        </div>

        <Detail label="City" value={show(s.city)} />
        <Detail label="Pincode" value={show(s.pincode)} />
      </Section>

      {/* ACADEMIC DETAILS */}
      <Section title="Academic details">
        <Detail label="Roll no." value={show(s.rollNo)} />
        <Detail label="Student ID" value={show(s.studentId)} />

        <Detail
          label="Department"
          value={department}
        />

        <Detail label="Course / Branch" value={show(s.course)} />

        <Detail
          label="Year / Semester"
          value={`${show(s.year)} · ${show(s.semester)}`}
        />

        <Detail
          label="Section"
          value={section}
        />
      </Section>

      {/* CHANGE PASSWORD */}
      <PasswordSteps />
    </>
  );
}
