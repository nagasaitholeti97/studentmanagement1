
import { request } from "./client";

import type {
  AcademicRegister,
  AttendanceReport,
  CalendarEvent,
  ClassInfo,
  ClassStudent,
  ExamSlot,
  FacultyProfile,
  LoginResponse,
  MarkAttendanceRequest,
  SavedMark,
  StudentProfile,
  TeachingPeriod,
} from "../types";

/* =========================
   AUTHENTICATION
========================= */

// Login - Student and Faculty
export const login = (identifier: string, password: string) =>
  request<LoginResponse>("POST", "/api/auth/login", {
    identifier,
    password,
  });

// Change password - Logged-in users
export const changePassword = (
  currentPassword: string,
  newPassword: string
) =>
  request<void>("PUT", "/api/auth/change-password", {
    currentPassword,
    newPassword,
  });

// Forgot password - Send secure reset link to registered email
export const requestPasswordReset = (email: string) =>
  request<void>("POST", "/api/auth/forgot-password", {
    email,
  });

// Reset password - Verify secure token and update password
export const resetPasswordWithToken = (
  token: string,
  newPassword: string
) =>
  request<void>("POST", "/api/auth/reset-password", {
    token,
    newPassword,
  });

/* =========================
   LEGACY OTP APIs
   Temporarily preserved
========================= */

export const sendOtp = (email: string) =>
  request<{ demoOtp?: string } | undefined>(
    "POST",
    "/api/auth/forgot-password/send-otp",
    { email }
  );

export const verifyOtp = (email: string, otp: string) =>
  request<void>(
    "POST",
    "/api/auth/forgot-password/verify-otp",
    { email, otp }
  );

export const resetPassword = (
  email: string,
  otp: string,
  newPassword: string
) =>
  request<void>(
    "POST",
    "/api/auth/forgot-password/reset",
    { email, otp, newPassword }
  );

// Verify current password
export const verifyPassword = (currentPassword: string) =>
  request<void>(
    "POST",
    "/api/auth/verify-password",
    { currentPassword }
  );

/* =========================
   STUDENT PORTAL
========================= */

export const getStudentProfile = () =>
  request<StudentProfile>("GET", "/api/students/me");

export type ReportQuery =
  | { type: "monthly"; month: string }
  | { type: "period"; from: string; to: string }
  | { type: "till-now" };

export const getAttendanceReport = (q: ReportQuery) =>
  request<AttendanceReport>(
    "GET",
    `/api/students/me/attendance-report?${new URLSearchParams(
      q as Record<string, string>
    )}`
  );

export const getRegister = () =>
  request<AcademicRegister>("GET", "/api/students/me/register");

export const getExams = () =>
  request<ExamSlot[]>("GET", "/api/students/me/exams");

/* =========================
   SHARED
========================= */

export const getCalendar = () =>
  request<CalendarEvent[]>("GET", "/api/calendar");

/* =========================
   FACULTY PORTAL
========================= */

export const getFacultyProfile = () =>
  request<FacultyProfile>("GET", "/api/faculty/me");

export const updateFacultyContact = (c: {
  phone: string;
  personalEmail: string;
}) =>
  request<FacultyProfile>("PUT", "/api/faculty/me/contact", c);

export const getMyClasses = () =>
  request<ClassInfo[]>("GET", "/api/faculty/me/classes");

export const getClass = (id: string) =>
  request<ClassInfo>("GET", `/api/classes/${id}`);

export const getClassStudents = (id: string) =>
  request<ClassStudent[]>("GET", `/api/classes/${id}/students`);

export const markAttendance = (payload: MarkAttendanceRequest) =>
  request<void>("POST", "/api/attendance", payload);

/* =========================
   FACULTY TEACHING PERIODS
========================= */

// Every period of the day for a class
export const getTeachingPeriods = (
  classId: string,
  date: string
) =>
  request<TeachingPeriod[]>(
    "GET",
    `/api/faculty/me/classes/${classId}/periods?date=${date}`
  );

// Only periods assigned to this faculty member
export const getMyTeachingPeriods = (
  classId: string,
  date: string
) =>
  getTeachingPeriods(classId, date).then((list) =>
    list.filter((p) => p.own !== false)
  );

// Saved attendance
export const getSavedAttendance = (
  classId: string,
  date: string,
  period: number
) =>
  request<SavedMark[]>(
    "GET",
    `/api/classes/${classId}/attendance?date=${date}&period=${period}`
  );
