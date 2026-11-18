import type {
    AcademicRegister, AttendanceReport, AttendanceRow, CalendarEvent, ClassInfo, ClassStudent, ExamSlot,
    FacultyProfile, LoginResponse, MarkAttendanceRequest, RegisterCell, RegisterDay,
    RegisterStatus, SavedMark, Status, StudentProfile, TeachingPeriod,
} from "../types";

/* ---- saved attendance (shared by faculty and student views) ---- */
const ATTENDANCE_KEY = "mock-attendance-v1";
const readAttendance = (): Record<string, Status> => {
    try { return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) ?? "{}"); } catch { return {}; }
};
function saveAttendance(req: MarkAttendanceRequest) {
    const store = readAttendance();
    for (const r of req.records) store[`${r.studentId}|${req.date}|${req.period}`] = r.status;
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(store));
}
function getStatus(studentId: string, date: string, period: number): Status | undefined {
    return readAttendance()[`${studentId}|${date}|${period}`];
}

/* ------------------------------------------------------------------ *
 * DEMO DATA: every class has its own students, and every student can log in.
 * ------------------------------------------------------------------ */

const PERIODS = 7;
const HISTORY_DAYS = 84; // about 12 weeks of seeded past attendance
const STUDENT_PASSWORD = "student123";
const FACULTY_PASSWORD = "faculty123";
const SUBJECT = "Signals & Systems"; // the subject this faculty member teaches

/** Shown on the login page in demo mode (Login.tsx imports this). */
export const DEMO = {
    student: { id: "student@college.edu", pw: STUDENT_PASSWORD },
    faculty: { id: "faculty@college.edu", pw: FACULTY_PASSWORD },
};

interface DemoClass {
    id: string; label: string; year: number; yearLabel: string;
    section: string; semester: string; subjects: string[];
}
interface DemoStudent {
    studentId: string; rollNo: string; name: string; email: string; personalEmail: string; phone: string;
    classId: string; rate: number; // % chance of "present" in the seeded history
    dateOfBirth?: string; // yyyy-mm-dd, only when a real date is known (otherwise the demo makes one up)
}

const CLASSES: DemoClass[] = [
    {
        id: "ece-1c", label: "1-Year ECE-C", year: 1, yearLabel: "1st Year", section: "ECE-C", semester: "1",
        subjects: [SUBJECT, "Maths-I", "Physics", "BEEE", "English", "C Programming", "Workshop"],
    },
    {
        id: "ece-2b", label: "2-Year ECE-B", year: 2, yearLabel: "2nd Year", section: "ECE-B", semester: "3",
        subjects: [SUBJECT, "EDC", "Network Theory", "Digital Logic", "Maths-III", "Python Lab", "Seminar"],
    },
    {
        id: "ece-3a", label: "3-Year ECE-A", year: 3, yearLabel: "3rd Year", section: "ECE-A", semester: "5",
        subjects: [SUBJECT, "DSD HDL", "AWP", "EE", "ADICD", "PYTHON", "ADC LAB"],
    },
];

let phoneCounter = 0;
const mk = (
    rollNo: string, name: string, classId: string, rate: number, email?: string,
    extra?: { personalEmail?: string; dateOfBirth?: string },
): DemoStudent => ({
    studentId: `s-${rollNo.toLowerCase()}`,
    rollNo,
    name,
    email: email ?? `${rollNo.toLowerCase()}@college.edu`,
    personalEmail: extra?.personalEmail ?? `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    phone: `+91 90000 ${10001 + phoneCounter++}`,
    classId,
    rate,
    dateOfBirth: extra?.dateOfBirth,
});

const STUDENTS: DemoStudent[] = [
    // 1-Year ECE-C
    mk("24EC3001", "Aarav Mehta", "ece-1c", 92),
    mk("24EC3002", "Diya Patel", "ece-1c", 88),
    mk("24EC3003", "Kabir Joshi", "ece-1c", 79),
    mk("24EC3004", "Nisha Iyer", "ece-1c", 95),
    mk("24EC3005", "Rahul Menon", "ece-1c", 71),
    mk("24EC3006", "Tanvi Kulkarni", "ece-1c", 84),
    // 2-Year ECE-B
    mk("23EC2001", "Arjun Naidu", "ece-2b", 90),
    mk("23EC2002", "Bhavana Rao", "ece-2b", 86),
    mk("23EC2003", "Charan Teja", "ece-2b", 77),
    mk("23EC2004", "Divya Prasad", "ece-2b", 93),
    mk("23EC2005", "Eshwar Reddy", "ece-2b", 73),
    mk("23EC2006", "Farhan Ali", "ece-2b", 82),
    // 3-Year ECE-A (Ananya keeps the original demo login: student@college.edu)
    mk("22EC1021", "Karthik Rao", "ece-3a", 89),
    mk("22EC1022", "Meera Nair", "ece-3a", 91),
    mk("22EC1023", "Rohan Gupta", "ece-3a", 80),
    mk("22EC1024", "Ananya Reddy", "ece-3a", 74, "student@college.edu"),
    mk("22EC1025", "Sana Sheikh", "ece-3a", 85),
    mk("22EC1026", "Vikram Singh", "ece-3a", 78),
    mk("22EC1027", "Prasad", "ece-3a", 87, undefined, { personalEmail: "krishnaprasadukkusuri@gmail.com", dateOfBirth: "2004-06-16" }),
    mk("22EC1028", "Naga Sai", "ece-3a", 83, undefined, { personalEmail: "nagasaitholeti97@gmail.com" }),
];

const FACULTY: FacultyProfile = {
    facultyId: "f-001",
    name: "Dr. Suresh Kumar",
    designation: "Associate Professor",
    department: "Electronics & Communication",
    email: "faculty@college.edu",
    personalEmail: "suresh.kumar@example.com",
    phone: "+91 90000 20001",
    gender: "Male",
    age: 42,
    qualification: "Ph.D. (Signal Processing), M.Tech (ECE)",
    experienceYears: 14,
    subjects: ["Signals & Systems", "Digital Signal Processing", "Analog Communications", "Digital Communications"],
};

/** One demo faculty login. `teaches` = the classes they take, and their subject(s) in each class. */
interface DemoFaculty { profile: FacultyProfile; teaches: Record<string, string[]> }

const FACULTY_LIST: DemoFaculty[] = [
    { profile: FACULTY, teaches: { "ece-1c": [SUBJECT], "ece-2b": [SUBJECT], "ece-3a": [SUBJECT] } },
    {
        profile: {
            facultyId: "f-002",
            name: "Dr. Anjali Rao",
            designation: "Professor",
            department: "Electronics & Communication",
            email: "faculty2@college.edu",
            personalEmail: "anjali.rao@example.com",
            phone: "+91 90000 20002",
            gender: "Female",
            age: 47,
            qualification: "Ph.D. (Mathematics), M.Sc (Mathematics)",
            experienceYears: 18,
            subjects: ["Maths-I", "Maths-III"],
        },
        teaches: { "ece-1c": ["Maths-I"], "ece-2b": ["Maths-III"] },
    },
    {
        profile: {
            facultyId: "f-003",
            name: "Mr. Imran Sheikh",
            designation: "Assistant Professor",
            department: "Electronics & Communication",
            email: "faculty3@college.edu",
            personalEmail: "imran.sheikh@example.com",
            phone: "+91 90000 20003",
            gender: "Male",
            age: 34,
            qualification: "M.Tech (VLSI Design), B.Tech (ECE)",
            experienceYears: 8,
            subjects: ["Physics", "EDC", "AWP"],
        },
        teaches: { "ece-1c": ["Physics"], "ece-2b": ["EDC"], "ece-3a": ["AWP"] },
    },
];

/* ------------------------------ helpers ------------------------------ */

const done = <T>(value: unknown): T => value as T;
const fail = (status: number, message: string) => Object.assign(new Error(message), { status });

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDate = (s: string) => new Date(`${s}T00:00:00`);
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const classOf = (s: DemoStudent) => CLASSES.find((c) => c.id === s.classId)!;
const studentsOf = (c: DemoClass): ClassStudent[] =>
    STUDENTS.filter((s) => s.classId === c.id).map(({ studentId, rollNo, name }) => ({ studentId, rollNo, name }));

/** How many classes of the given subject(s) were held and attended, for one student. */
const subjectTally = (s: DemoStudent, subjects: string[]) => {
    const rows = rowsFromDays(registerFor(s).days, subjects).filter((r) => subjects.includes(r.subject));
    return { held: rows.reduce((n, r) => n + r.held, 0), attended: rows.reduce((n, r) => n + r.attended, 0) };
};
/** The classes a faculty member takes, and the subject(s) they teach in a class. */
const classesOf = (f: DemoFaculty) => CLASSES.filter((c) => f.teaches[c.id]);
const subjectsIn = (f: DemoFaculty, c: DemoClass) => f.teaches[c.id] ?? [];
const rosterWithStats = (c: DemoClass, f: DemoFaculty): ClassStudent[] =>
    STUDENTS.filter((s) => s.classId === c.id).map((s) => ({ studentId: s.studentId, rollNo: s.rollNo, name: s.name, ...subjectTally(s, subjectsIn(f, c)) }));
const classInfo = (c: DemoClass, f: DemoFaculty): ClassInfo => {
    const subjects = subjectsIn(f, c);
    const pcts = STUDENTS.filter((s) => s.classId === c.id).map((s) => {
        const t = subjectTally(s, subjects);
        return t.held ? (t.attended / t.held) * 100 : 0;
    });
    return {
        id: c.id, label: c.label, year: c.year, section: c.section, subject: subjects.join(", "), studentCount: pcts.length,
        average: Math.round(pcts.reduce((a, b) => a + b, 0) / Math.max(1, pcts.length)),
        below75: pcts.filter((p) => p < 75).length,
    };
};
const subjectFor = (c: DemoClass, date: string, period: number) =>
    c.subjects[(period - 1 + parseDate(date).getDay()) % c.subjects.length];

function hash(s: string) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
}
const seededStatus = (s: DemoStudent, date: string, period: number): RegisterStatus =>
    hash(`${s.studentId}|${date}|${period}`) % 100 < s.rate ? "PRESENT" : "ABSENT";

/* ----------------------------- calendar ------------------------------ */

/** Holidays only. Kept apart from calendar() so the exam dates can skip them. */
const holidays = (): CalendarEvent[] => {
    const at = (offset: number) => ymd(addDays(new Date(), offset));
    return [
        { id: "e1", title: "Festival holiday", type: "HOLIDAY", start: at(-20), end: at(-20) },
        { id: "e6", title: "Public holiday", type: "HOLIDAY", start: at(33), end: at(33) },
        { id: "e4", title: "Winter break", type: "HOLIDAY", start: at(45), end: at(52) },
    ];
};
const isHoliday = (date: string) => holidays().some((e) => e.start <= date && date <= e.end);

const MID_GAP_DAYS = 45; // classes begin -> Mid 1, and Mid 1 ends -> Mid 2 starts (about 1.5 months)
const SEM_GAP_DAYS = 7; // Mid 2 ends -> semester exams start (1 week)
const MID_PAPER_GAP = 0; // mid exam papers are on consecutive working days
const SEM_PAPER_GAP = 1; // semester exam papers have one free day between them

/**
 * Demo timeline: classes begin, Mid 1 after 1.5 months, Mid 2 another 1.5 months after Mid 1 ends,
 * semester exams 1 week after Mid 2 ends. One subject per paper. Papers never fall on a Sunday or a public holiday;
 * semester papers also leave one free day between them.
 */
function examsFor(s: DemoStudent): ExamSlot[] {
    const cls = classOf(s);
    const workingDay = (d: Date) => { let x = d; while (x.getDay() === 0 || isHoliday(ymd(x))) x = addDays(x, 1); return x; };
    const build = (type: ExamSlot["type"], from: Date, gap: number): ExamSlot[] => {
        const out: ExamSlot[] = [];
        let d = workingDay(from);
        for (const subject of cls.subjects) {
            out.push({ id: `${type}-${out.length + 1}`, type, subject, code: subjectMeta(subject).code, date: ymd(d) });
            d = workingDay(addDays(d, 1 + gap));
        }
        return out;
    };
    const lastDay = (slots: ExamSlot[]) => parseDate(slots[slots.length - 1].date);

    const classesBegin = addDays(new Date(), -HISTORY_DAYS); // same start as the 12 weeks of seeded attendance
    const mid1 = build("MID1", addDays(classesBegin, MID_GAP_DAYS), MID_PAPER_GAP);
    const mid2 = build("MID2", addDays(lastDay(mid1), MID_GAP_DAYS), MID_PAPER_GAP);
    const sem = build("SEMESTER", addDays(lastDay(mid2), SEM_GAP_DAYS), SEM_PAPER_GAP);
    return [...mid1, ...mid2, ...sem];
}

function calendar(): CalendarEvent[] {
    const slots = examsFor(STUDENTS[0]);
    const examWindow = (type: ExamSlot["type"], id: string, title: string): CalendarEvent => {
        const x = slots.filter((e) => e.type === type);
        return { id, title, type: "EXAM", start: x[0].date, end: x[x.length - 1].date };
    };
    const mid2 = examWindow("MID2", "e2", "Mid 2 exams");
    const annualDay = ymd(addDays(parseDate(mid2.end), 3));
    const [festival, winter] = holidays();
    return [
        festival,
        examWindow("MID1", "e0", "Mid 1 exams"),
        mid2,
        { id: "e3", title: "Annual day", type: "EVENT", start: annualDay, end: annualDay },
        winter,
        examWindow("SEMESTER", "e5", "Semester exams"),
    ];
}

/**
 * Every period of the day (none on Sundays and holidays), so any teacher can take any period
 * (free period, or a substitute when the scheduled teacher does not come).
 * `own` = the timetable has this faculty member's subject in that period.
 */
function teachingPeriods(cls: DemoClass, date: string, mine: string[]): TeachingPeriod[] {
    if (parseDate(date).getDay() === 0 || isHoliday(date)) return [];
    const ids = studentsOf(cls).map((s) => s.studentId);
    const out: TeachingPeriod[] = [];
    for (let p = 1; p <= PERIODS; p++) {
        const subject = subjectFor(cls, date, p);
        out.push({
            period: p,
            subject,
            own: mine.includes(subject),
            saved: ids.some((id) => getStatus(id, date, p) !== undefined),
        });
    }
    return out;
}

/* --------------- register and report (saved attendance wins) --------------- */

function registerFor(s: DemoStudent): AcademicRegister {
    const cls = classOf(s);
    const today = ymd(new Date());
    const days: RegisterDay[] = [];

    for (let i = HISTORY_DAYS; i >= 0; i--) {
        const d = addDays(new Date(), -i);
        const date = ymd(d);
        // Sundays and calendar holidays show as green holiday rows, like the college register.
        if (d.getDay() === 0 || isHoliday(date)) { days.push({ date, holiday: true, cells: [] }); continue; }

        const cells: RegisterCell[] = [];
        for (let p = 1; p <= PERIODS; p++) {
            const saved = getStatus(s.studentId, date, p); // what faculty saved
            const status: RegisterStatus = saved ?? (date < today ? seededStatus(s, date, p) : "NOT_ENTERED");
            cells.push({ period: p, subject: subjectFor(cls, date, p), status });
        }
        days.push({ date, holiday: false, cells });
    }
    return { rollNo: s.rollNo, name: s.name, semester: cls.semester, days };
}

const FACULTY_NAMES = ["Prof. Suresh Varma", "Dr. Anjali Rao", "Dr. Kavitha Reddy", "Mr. Imran Sheikh", "Dr. Lakshmi Prasad"];
const subjectMeta = (subject: string) => {
    const h = hash(subject);
    return { code: `ECE${200 + (h % 90)}`, faculty: FACULTY_NAMES[h % FACULTY_NAMES.length] };
};

/** Every subject of the class is listed, even with 0 classes held (like the college report). */
function rowsFromDays(days: RegisterDay[], subjects: string[]): AttendanceRow[] {
    const bySubject = new Map<string, AttendanceRow>(
        subjects.map((subject): [string, AttendanceRow] => [subject, { subject, ...subjectMeta(subject), held: 0, attended: 0 }]),
    );
    for (const d of days) {
        if (d.holiday) continue;
        for (const c of d.cells) {
            if (c.status !== "PRESENT" && c.status !== "ABSENT") continue;
            const row = bySubject.get(c.subject) ?? { subject: c.subject, ...subjectMeta(c.subject), held: 0, attended: 0 };
            row.held += 1;
            if (c.status === "PRESENT") row.attended += 1;
            bySubject.set(c.subject, row);
        }
    }
    return [...bySubject.values()];
}

function reportFor(s: DemoStudent, query: URLSearchParams): AttendanceReport {
    let days = registerFor(s).days;
    const type = query.get("type");
    if (type === "monthly") {
        const month = query.get("month") ?? "";
        days = days.filter((d) => d.date.startsWith(month));
    }
    if (type === "period") {
        const from = query.get("from") ?? "";
        const to = query.get("to") ?? "9999-12-31";
        days = days.filter((d) => d.date >= from && d.date <= to);
    }
    const cls = classOf(s);
    return {
        rollNo: s.rollNo, name: s.name, program: "B.Tech",
        branch: "Electronics & Communication Engineering",
        semester: cls.semester, rows: rowsFromDays(days, cls.subjects),
    };
}

// Fake personal details so the profile page has something to show. A real backend sends the real ones.
const FEMALE_NAMES = new Set(["Diya", "Nisha", "Tanvi", "Bhavana", "Divya", "Meera", "Ananya", "Sana"]);
const FATHERS = ["Ramesh", "Suresh", "Venkat", "Mohan", "Prakash", "Anil"];
const MOTHERS = ["Lakshmi", "Sunita", "Padma", "Kavitha", "Radha", "Geeta"];

const profileOf = (s: DemoStudent): StudentProfile => {
    const cls = classOf(s);
    const [first, ...rest] = s.name.split(" ");
    const surname = rest[rest.length - 1] ?? first;
    const h = hash(s.studentId);
    return {
        studentId: s.studentId, rollNo: s.rollNo, name: s.name, email: s.email, personalEmail: s.personalEmail, phone: s.phone,
        gender: FEMALE_NAMES.has(first) ? "Female" : "Male",
        dateOfBirth: s.dateOfBirth ?? `${2007 - cls.year}-${pad(1 + (h % 12))}-${pad(1 + ((h >>> 4) % 28))}`,
        fatherName: `${FATHERS[h % FATHERS.length]} ${surname}`,
        motherName: `${MOTHERS[(h >>> 3) % MOTHERS.length]} ${surname}`,
        parentPhone: `+91 98480 ${10000 + (h % 90000)}`,
        address: `${1 + (h % 40)}-${1 + ((h >>> 3) % 30)}-${1 + ((h >>> 6) % 90)}, Gandhi Nagar`,
        city: "Hyderabad", pincode: `5000${pad(10 + (h % 80))}`,
        department: "Electronics & Communication Engineering", course: "B.Tech",
        year: cls.yearLabel, semester: cls.semester, section: cls.section,
    };
};

/* --------------------- accounts, tokens and passwords --------------------- */

const facultyToken = (f: DemoFaculty) => `mock.faculty.${f.profile.facultyId}`;
const studentToken = (s: DemoStudent) => `mock.student.${s.studentId}`;

const PASSWORD_KEY = "mock-passwords-v1"; // demo only: real passwords must be hashed on the server
const readPasswords = (): Record<string, string> => {
    try { return JSON.parse(localStorage.getItem(PASSWORD_KEY) ?? "{}"); } catch { return {}; }
};
const passwordFor = (id: string, fallback: string) => readPasswords()[id] ?? fallback;
const setPassword = (id: string, value: string) =>
    localStorage.setItem(PASSWORD_KEY, JSON.stringify({ ...readPasswords(), [id]: value }));

/* ------------------ forgot-password OTPs (demo only) ------------------ */

const OTP_TTL_MS = 5 * 60 * 1000; // an OTP works for 5 minutes
const OTP_MAX_TRIES = 5; // wrong guesses allowed before a new OTP is needed
const otpStore = new Map<string, { code: string; expires: number; tries: number }>();

/** Finds an account from a registered email (a student's or faculty member's college email or personal email). */
function accountByEmail(email: string): { id: string } | null {
    const e = email.trim().toLowerCase();
    const s = STUDENTS.find((x) => x.email.toLowerCase() === e || x.personalEmail.toLowerCase() === e);
    if (s) return { id: s.studentId };
    const f = FACULTY_LIST.find((x) => e === x.profile.email.toLowerCase() || e === x.profile.personalEmail.toLowerCase());
    if (f) return { id: f.profile.facultyId };
    return null;
}

/** Throws unless this email has a live OTP and the code matches. Used by both "verify" and "reset". */
function checkOtp(email: string, otp: string) {
    const key = email.trim().toLowerCase();
    const rec = otpStore.get(key);
    if (!rec) throw fail(400, "Please request an OTP first.");
    if (Date.now() > rec.expires) { otpStore.delete(key); throw fail(400, "This OTP has expired. Please request a new one."); }
    if (rec.tries >= OTP_MAX_TRIES) { otpStore.delete(key); throw fail(429, "Too many wrong attempts. Please request a new OTP."); }
    if (rec.code !== otp.trim()) { rec.tries += 1; throw fail(400, "Wrong OTP. Please check and try again."); }
}

function account(token: string | null) {
    const f = FACULTY_LIST.find((x) => token === facultyToken(x));
    if (f) return { id: f.profile.facultyId, defaultPassword: FACULTY_PASSWORD };
    const s = STUDENTS.find((x) => token === studentToken(x));
    if (s) return { id: s.studentId, defaultPassword: STUDENT_PASSWORD };
    throw fail(401, "Please log in again.");
}
function currentStudent(token: string | null): DemoStudent {
    const s = STUDENTS.find((x) => token === studentToken(x));
    if (!s) throw fail(401, "Please log in as a student.");
    return s;
}
function requireFaculty(token: string | null): DemoFaculty {
    const f = FACULTY_LIST.find((x) => token === facultyToken(x));
    if (!f) throw fail(401, "Please log in as faculty.");
    return f;
}
/** A class this faculty member takes (other faculty's classes are "not found" for them). */
function ownClass(f: DemoFaculty, id: string): DemoClass {
    const cls = CLASSES.find((c) => c.id === id && f.teaches[c.id]);
    if (!cls) throw fail(404, "Class not found.");
    return cls;
}

/* ------------------------------ the mock API ------------------------------ */

export async function mockRequest<T>(
    method: string, path: string, body: unknown, token: string | null,
): Promise<T> {
    const [route, queryString = ""] = path.split("?");
    const query = new URLSearchParams(queryString);

    // ---- Auth ----
    if (method === "POST" && route === "/api/auth/login") {
        const { identifier = "", password = "" } = (body ?? {}) as { identifier?: string; password?: string };
        const id = identifier.trim().toLowerCase();

        const student = STUDENTS.find((s) => s.rollNo.toLowerCase() === id || s.email === id);
        if (student && password === passwordFor(student.studentId, STUDENT_PASSWORD)) {
            const res: LoginResponse = { token: studentToken(student), role: "STUDENT" };
            return done<T>(res);
        }
        const faculty = FACULTY_LIST.find((x) => id === x.profile.email.toLowerCase() || id === x.profile.facultyId.toLowerCase());
        if (faculty && password === passwordFor(faculty.profile.facultyId, FACULTY_PASSWORD)) {
            const res: LoginResponse = { token: facultyToken(faculty), role: "FACULTY" };
            return done<T>(res);
        }
        throw fail(401, "Invalid roll number / email or password.");
    }
    // ---- Forgot password: send OTP -> verify OTP -> set new password ----
    if (method === "POST" && route === "/api/auth/forgot-password/send-otp") {
        const { email = "" } = (body ?? {}) as { email?: string };
        if (!email.trim()) throw fail(400, "Enter your registered email.");
        if (!accountByEmail(email)) throw fail(404, "Wrong email. This email is not registered.");
        const code = String(100000 + Math.floor(Math.random() * 900000));
        otpStore.set(email.trim().toLowerCase(), { code, expires: Date.now() + OTP_TTL_MS, tries: 0 });
        return done<T>({ demoOtp: code }); // demo only: a real backend emails the OTP and never returns it
    }
    if (method === "POST" && route === "/api/auth/forgot-password/verify-otp") {
        const { email = "", otp = "" } = (body ?? {}) as { email?: string; otp?: string };
        checkOtp(email, otp);
        return done<T>(undefined);
    }
    if (method === "POST" && route === "/api/auth/forgot-password/reset") {
        const { email = "", otp = "", newPassword = "" } = (body ?? {}) as { email?: string; otp?: string; newPassword?: string };
        checkOtp(email, otp); // checked again here, so the new password cannot be set without a valid OTP
        if (newPassword.length < 8) throw fail(400, "New password must be at least 8 characters.");
        const acc = accountByEmail(email);
        if (!acc) throw fail(404, "Wrong email. This email is not registered.");
        setPassword(acc.id, newPassword);
        otpStore.delete(email.trim().toLowerCase());
        return done<T>(undefined);
    }
    if (method === "POST" && route.startsWith("/api/auth/forgot")) return done<T>(undefined);
    if (method === "POST" && route === "/api/auth/verify-password") {
        const acc = account(token);
        const { currentPassword = "" } = (body ?? {}) as { currentPassword?: string };
        if (currentPassword !== passwordFor(acc.id, acc.defaultPassword)) throw fail(400, "Current password is incorrect.");
        return done<T>(undefined);
    }
    if (method === "PUT" && route === "/api/auth/change-password") {
        const acc = account(token);
        const { currentPassword = "", newPassword = "" } =
            (body ?? {}) as { currentPassword?: string; newPassword?: string };
        if (currentPassword !== passwordFor(acc.id, acc.defaultPassword)) throw fail(400, "Current password is incorrect.");
        if (newPassword.length < 6) throw fail(400, "New password must be at least 6 characters.");
        setPassword(acc.id, newPassword);
        return done<T>(undefined);
    }

    // ---- Student portal (each student only ever sees their own data) ----
    if (method === "GET" && route === "/api/students/me") return done<T>(profileOf(currentStudent(token)));
    if (method === "GET" && route === "/api/students/me/exams") return done<T>(examsFor(currentStudent(token)));
    if (method === "GET" && route === "/api/students/me/register") return done<T>(registerFor(currentStudent(token)));
    if (method === "GET" && route === "/api/students/me/attendance-report") {
        return done<T>(reportFor(currentStudent(token), query));
    }

    // ---- Shared ----
    if (method === "GET" && route === "/api/calendar") { account(token); return done<T>(calendar()); }

    // ---- Faculty portal ----
    if (method === "GET" && route === "/api/faculty/me") { return done<T>(requireFaculty(token).profile); }
    if (method === "PUT" && route === "/api/faculty/me/contact") {
        const me = requireFaculty(token);
        const { phone = "", personalEmail = "" } = (body ?? {}) as { phone?: string; personalEmail?: string };
        if (!/^[+\d][\d\s-]{7,17}$/.test(phone.trim())) throw fail(400, "Enter a valid phone number.");
        if (!/^\S+@\S+\.\S+$/.test(personalEmail.trim())) throw fail(400, "Enter a valid email address.");
        Object.assign(me.profile, { phone: phone.trim(), personalEmail: personalEmail.trim() });
        return done<T>({ ...me.profile });
    }
    if (method === "GET" && route === "/api/faculty/me/classes") {
        const me = requireFaculty(token);
        return done<T>(classesOf(me).map((c) => classInfo(c, me)));
    }
    const classMatch = route.match(/^\/api\/classes\/([^/]+)(\/students)?$/);
    if (method === "GET" && classMatch) {
        const me = requireFaculty(token);
        const cls = ownClass(me, classMatch[1]);
        return done<T>(classMatch[2] ? rosterWithStats(cls, me) : classInfo(cls, me));
    }
    const periodsMatch = route.match(/^\/api\/faculty\/me\/classes\/([^/]+)\/periods$/);
    if (method === "GET" && periodsMatch) {
        const me = requireFaculty(token);
        const cls = ownClass(me, periodsMatch[1]);
        return done<T>(teachingPeriods(cls, query.get("date") ?? ymd(new Date()), subjectsIn(me, cls)));
    }
    const savedMatch = route.match(/^\/api\/classes\/([^/]+)\/attendance$/);
    if (method === "GET" && savedMatch) {
        const me = requireFaculty(token);
        const cls = ownClass(me, savedMatch[1]);
        const date = query.get("date") ?? "";
        const period = Number(query.get("period"));
        const marks: SavedMark[] = [];
        for (const s of studentsOf(cls)) {
            const status = getStatus(s.studentId, date, period);
            if (status) marks.push({ studentId: s.studentId, status });
        }
        return done<T>(marks);
    }

    // ---- Faculty saves attendance ----
    if (method === "POST" && route === "/api/attendance") {
        const me = requireFaculty(token);
        const req = body as MarkAttendanceRequest;
        const cls = ownClass(me, req.classId);
        if (req.date > ymd(new Date())) throw fail(400, "You cannot mark attendance for a future date.");
        if (!Number.isInteger(req.period) || req.period < 1 || req.period > PERIODS) throw fail(400, "Invalid period.");
        const valid = new Set(studentsOf(cls).map((s) => s.studentId));
        if (req.records.some((r) => !valid.has(r.studentId))) throw fail(400, "Some students are not in this class.");
        saveAttendance(req);
        return done<T>(undefined);
    }

    throw fail(404, `The demo API has no ${method} ${route}`);
}