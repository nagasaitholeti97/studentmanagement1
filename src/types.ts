export type Role = "STUDENT" | "FACULTY";
export type Status = "PRESENT" | "ABSENT";
/** One exam paper in the Mid 1, Mid 2 or Semester exam schedule. */
export interface ExamSlot { id: string; type: "MID1" | "MID2" | "SEMESTER"; subject: string; code?: string; date: string }

/** POST /api/auth/login response. The backend decides the role from the Users table. */
export interface LoginResponse { token: string; role: Role }

export interface StudentProfile {
  // identity and contact
  studentId: string; rollNo: string; name: string; email: string; personalEmail?: string; phone: string;
  // personal (age is worked out from dateOfBirth in the frontend)
  gender: string; dateOfBirth: string; // yyyy-mm-dd
  // parents
  fatherName: string; motherName: string; parentPhone: string;
  // address
  address: string; city: string; pincode: string;
  // academic
  department: string; course: string; year: string; semester: string; section: string;
}
export interface FacultyProfile {
  facultyId: string; name: string; designation: string; department: string;
  email: string; personalEmail: string; phone: string;
  gender: string; age?: number; qualification: string; experienceYears: number;
  subjects: string[]; // subjects this faculty member can teach
}
/** One subject line of an attendance report. The backend sends counts; the frontend works out % and totals. */
export interface AttendanceRow { subject: string; code?: string; faculty?: string; held: number; attended: number }
export interface AttendanceReport { rollNo: string; name: string; program: string; branch: string; semester: string; rows: AttendanceRow[] }
export interface CalendarEvent { id: string; title: string; type: "HOLIDAY" | "EXAM" | "EVENT"; start: string; end: string }
/** One hour-cell in the academic register (same colours as the college register). */
export type RegisterStatus = "PRESENT" | "ABSENT" | "NOT_ENTERED" | "NO_CLASS_WORK";
export interface RegisterCell { period: number; subject: string; status: RegisterStatus }
export interface RegisterDay { date: string; holiday: boolean; cells: RegisterCell[] }
export interface AcademicRegister { rollNo: string; name: string; semester: string; days: RegisterDay[] }
/** average = class average attendance (%) in this faculty member's subject; below75 = students under 75%. */
export interface ClassInfo { id: string; label: string; year: number; section: string; subject: string; studentCount: number; average?: number; below75?: number }
/** held / attended = classes of this faculty member's subject for the student. */
export interface ClassStudent { studentId: string; rollNo: string; name: string; held?: number; attended?: number }
export interface MarkAttendanceRequest {
  classId: string; date: string; period: number;
  records: { studentId: string; status: Status }[];
}
/** A period of the day for a class. own = this faculty member's subject is scheduled; false = substitute or free period. */
export interface TeachingPeriod { period: number; subject: string; saved: boolean; own?: boolean }
/** Attendance already saved for one class, date and period. */
export interface SavedMark { studentId: string; status: Status }