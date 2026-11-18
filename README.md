# Student Attendance Management System: Frontend

React + TypeScript + Tailwind CSS (Vite). Talks to the Spring Boot REST API with a JWT.

## Run
    npm install
    npm run dev          # http://localhost:5173

Demo mode is on by default (`VITE_USE_MOCK=true` in `.env`):
- Student: student@college.edu / student123
- Faculty: faculty@college.edu / faculty123

## Connect to the backend
1. In `.env` set `VITE_USE_MOCK=false` and `VITE_API_URL=<your Spring Boot URL>`.
2. Enable CORS in Spring Boot for `http://localhost:5173`.
3. Implement these endpoints (all except login need `Authorization: Bearer <jwt>`):

| Method | Endpoint | Returns / takes |
| --- | --- | --- |
| POST | /api/auth/login | `{identifier, password}` -> `{token, role: "STUDENT" \| "FACULTY"}` |
| PUT | /api/auth/change-password | `{currentPassword, newPassword}` |
| GET | /api/students/me | StudentProfile |
| GET | /api/students/me/attendance | `[{date, period, subject, status: "PRESENT" \| "ABSENT"}]` |
| GET | /api/students/me/timetable | `[{day, period, time, subject}]` |
| GET | /api/calendar | `[{id, title, type: HOLIDAY \| EXAM \| EVENT, start, end}]` |
| GET | /api/faculty/me | FacultyProfile |
| GET | /api/faculty/me/classes | `[{id, label, year, section, subject, studentCount}]` |
| GET | /api/classes/{id} | one class |
| GET | /api/classes/{id}/students | `[{studentId, rollNo, name}]` |
| POST | /api/attendance | `{classId, date, period, records:[{studentId, status}]}` |

Types live in `src/types.ts`; every call is in `src/api/index.ts`. Role-based access must also be enforced by Spring Security: the frontend routes only control what is shown.

## Flow
`/login` (one page) -> backend returns the role -> `/student/*` or `/faculty/*`.
Student: Profile, Attendance (Till now / Monthly / Period), Academic calendar (time table).
Faculty: Profile, Classes attending -> class (Students list with attendance marking, Academic calendar).
