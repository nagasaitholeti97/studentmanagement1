// Demo data so the UI works before the Spring Boot backend is ready.
// Set VITE_USE_MOCK=false in .env to switch to the real API.
import type {
  AcademicRegister, AttendanceReport, CalendarEvent, ClassInfo, ClassStudent, FacultyProfile,
  LoginResponse, RegisterDay, RegisterStatus, Role, StudentProfile,
} from "../types";

export const DEMO = {
  student: { id: "student@college.edu", pw: "student123" },
  faculty: { id: "faculty@college.edu", pw: "faculty123" },
};

const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const err = (status: number, message: string) => Object.assign(new Error(message), { status });

const student: StudentProfile = {
  studentId: "S-1024", rollNo: "22EC1024", name: "Ananya Reddy", email: DEMO.student.id,
  phone: "+91 98765 43210", department: "Electronics & Communication", course: "B.Tech ECE",
  year: "3rd Year", semester: "V Semester", section: "ECE-A",
  gender: "Female", dateOfBirth: "2004-08-14",
  fatherName: "Venkat Reddy", motherName: "Lakshmi Reddy", parentPhone: "+91 98480 12345",
  address: "12-4-56, Gandhi Nagar", city: "Hyderabad", pincode: "500072",
};
const faculty: FacultyProfile = {
  facultyId: "F-204", name: "Dr. Suresh Kumar", designation: "Associate Professor",
  department: "Electronics & Communication",
  email: DEMO.faculty.id, personalEmail: "suresh.kumar@example.com", phone: "+91 91234 56780",
  gender: "Male", qualification: "Ph.D. (Signal Processing), M.Tech (ECE)", experienceYears: 14,
  subjects: ["Signals & Systems", "Digital Signal Processing", "Analog Communications", "Digital Communications"],
};
const hours = ["DSD HDL", "ADC LAB", "ADICD", "AWP", "DC", "PYTHON", "EE"];
const lastHour = ["LIBRARY", "SPORTS", "ANTENNA LB"];

// 7 hours a day, Sundays are holidays. Today's later hours are "not entered" yet.
function buildRegister(): AcademicRegister {
  const days: RegisterDay[] = [];
  const end = new Date(); end.setHours(12, 0, 0, 0);
  const start = new Date(end); start.setDate(end.getDate() - 133);
  const today = end.toISOString().slice(0, 10);
  let n = 0;
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1), n++) {
    const date = d.toISOString().slice(0, 10);
    if (d.getDay() === 0) { days.push({ date, holiday: true, cells: [] }); continue; }
    const cells = Array.from({ length: 7 }, (_, i) => {
      const h = (n * 7 + i * 5) % 17;
      let status: RegisterStatus = h < 4 ? "ABSENT" : "PRESENT";
      if (h === 16) status = "NO_CLASS_WORK";
      if (date === today && i >= 3) status = "NOT_ENTERED";
      const subject = i === 6 && n % 3 === 1 ? lastHour[n % 3] : hours[(n + i * 3) % hours.length];
      return { period: i + 1, subject, status };
    });
    days.push({ date, holiday: false, cells });
  }
  return { rollNo: student.rollNo, name: student.name, semester: student.semester, days };
}
const register = buildRegister();

// Every subject of the semester is listed, even with 0 classes held (like the college report).
const allSubjects = ["ADICDLAB", "ADC LAB", "Skill E Co", "ANTENNA LB", "CSP", "APT", "EE", "LIBRARY", "SPORTS", "UTS ES", "ADICD", "DC", "AWP", "DSD HDL", "PYTHON"];

function buildReport(lo: string, hi: string): AttendanceReport {
  const rows = allSubjects.map((subject) => ({ subject, held: 0, attended: 0 }));
  for (const day of register.days) {
    if (day.date < lo || day.date > hi) continue;
    for (const c of day.cells) {
      const row = rows.find((r) => r.subject === c.subject);
      if (!row || (c.status !== "PRESENT" && c.status !== "ABSENT")) continue;
      row.held += 1;
      if (c.status === "PRESENT") row.attended += 1;
    }
  }
  return { rollNo: student.rollNo, name: student.name, program: "B.Tech", branch: "ECE", semester: student.semester, rows };
}

const y = new Date().getFullYear();
const events: CalendarEvent[] = [
  { id: "1", title: "Mid-term examinations", type: "EXAM", start: `${y}-11-24`, end: `${y}-11-29` },
  { id: "2", title: "Annual tech symposium", type: "EVENT", start: `${y}-12-05`, end: `${y}-12-06` },
  { id: "3", title: "Winter break", type: "HOLIDAY", start: `${y}-12-24`, end: `${y + 1}-01-02` },
  { id: "4", title: "Republic Day", type: "HOLIDAY", start: `${y + 1}-01-26`, end: `${y + 1}-01-26` },
  { id: "5", title: "End-semester examinations", type: "EXAM", start: `${y + 1}-03-10`, end: `${y + 1}-03-24` },
];

const classes: ClassInfo[] = [
  { id: "ece-1c", label: "1-Year ECE-C", year: 1, section: "C", subject: "Signals & Systems", studentCount: 6 },
  { id: "ece-2b", label: "2-Year ECE-B", year: 2, section: "B", subject: "Signals & Systems", studentCount: 6 },
  { id: "ece-3a", label: "3-Year ECE-A", year: 3, section: "A", subject: "Signals & Systems", studentCount: 6 },
];
const names = ["Ananya Reddy", "Karthik Rao", "Meera Nair", "Rohan Gupta", "Sana Sheikh", "Vikram Singh"];
const roster = (id: string): ClassStudent[] =>
  names.map((name, i) => ({ studentId: `${id}-${i + 1}`, rollNo: `${id.toUpperCase()}-${String(i + 1).padStart(3, "0")}`, name }));

export async function mockRequest<T>(method: string, path: string, body: unknown, token: string | null): Promise<T> {
  await wait();
  const role = token?.startsWith("mock-") ? (token.slice(5) as Role) : null;
  const ok = (v: unknown) => v as T;

  if (method === "POST" && path === "/api/auth/login") {
    const { identifier, password } = body as { identifier: string; password: string };
    const id = identifier.trim().toLowerCase();
    if (id === DEMO.student.id && password === DEMO.student.pw) return ok({ token: "mock-STUDENT", role: "STUDENT" } satisfies LoginResponse);
    if (id === DEMO.faculty.id && password === DEMO.faculty.pw) return ok({ token: "mock-FACULTY", role: "FACULTY" } satisfies LoginResponse);
    throw err(401, "Incorrect register number / email or password.");
  }
  if (!role) throw err(401, "Please sign in again.");
  if (method === "PUT" && path === "/api/auth/change-password") return ok(undefined);
  if (path === "/api/calendar") return ok(events);

  if (role === "STUDENT") {
    if (path === "/api/students/me") return ok(student);
    if (path.startsWith("/api/students/me/attendance-report")) {
      const q = new URL(path, "http://mock").searchParams;
      const type = q.get("type");
      if (type === "monthly") return ok(buildReport(`${q.get("month")}-01`, `${q.get("month")}-31`));
      if (type === "period") return ok(buildReport(q.get("from") ?? "", q.get("to") ?? ""));
      return ok(buildReport("0000-00-00", "9999-99-99"));
    } if (path === "/api/students/me/register") return ok(register);
  }
  if (role === "FACULTY") {
    if (path === "/api/faculty/me") return ok(faculty);
    if (path === "/api/faculty/me/classes") return ok(classes);
    const cls = path.match(/^\/api\/classes\/([^/]+)(\/students)?$/);
    if (cls) {
      const found = classes.find((c) => c.id === cls[1]);
      if (!found) throw err(404, "Class not found.");
      return ok(cls[2] ? roster(found.id) : found);
    }
    if (method === "POST" && path === "/api/attendance") return ok(undefined);
  }
  throw err(403, "You do not have access to this page.");
}
