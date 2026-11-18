# SAMS Spring Boot backend
Java 21 · Spring Boot 3.5 · PostgreSQL · REST · JWT Bearer authentication · SendGrid email · Flyway.

## Run locally
1. Install JDK 21+, Maven 3.9+, PostgreSQL 15+.
2. Create DB: `CREATE DATABASE sams_db;`
3. Set environment variables from `.env.example` (PowerShell shown):
```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/sams_db"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"
$env:JWT_SECRET="use-a-random-secret-of-at-least-32-characters"
$env:FRONTEND_URL="http://localhost:5173"
$env:SENDGRID_API_KEY="SG..."
$env:SENDGRID_FROM_EMAIL="verified-sender@yourdomain.com"
```
4. Run `mvn spring-boot:run`. Flyway creates tables. The demo data initializer seeds a small dataset only when there are no users.

Demo logins (development only):
- Student: `student@college.edu` or `22EC1024` / `student123`
- Faculty: `faculty@college.edu` or `f-001` / `faculty123`

## Frontend connection
In the React project `.env`:
```env
VITE_API_URL=http://localhost:8080
VITE_USE_MOCK=false
```
Restart Vite after changing environment variables. The existing API client already sends `Authorization: Bearer <JWT>`.

## Routes implemented
- `POST /api/auth/login` body `{ "identifier":"student@college.edu", "password":"student123" }`
- `PUT /api/auth/change-password` body `{ "currentPassword":"...", "newPassword":"..." }`
- `POST /api/auth/forgot-password` body `{ "email":"..." }`
- `POST /api/auth/reset-password` body `{ "token":"...", "newPassword":"..." }`
- `GET /api/students/me`, `/api/students/me/register`, `/api/students/me/attendance-report`, `/api/students/me/exams`
- `GET /api/faculty/me`, `PUT /api/faculty/me/contact`, `GET /api/faculty/me/classes`
- `GET /api/classes/{classId}`, `GET /api/classes/{classId}/students`
- `GET /api/faculty/me/classes/{classId}/periods?date=YYYY-MM-DD`
- `GET /api/classes/{classId}/attendance?date=YYYY-MM-DD&period=1`
- `POST /api/attendance` body `{ "classId":"ece-3a", "date":"2026-11-16", "period":1, "records":[{"studentId":"UUID","status":"PRESENT"}] }`
- `GET /api/calendar`

## Important integration details
- `classId` is the class code (e.g. `ece-3a`) and matches the frontend's mock API convention.
- Real attendance is stored only when faculty submits it. No fake attendance history is generated.
- The register currently returns dates with saved attendance only; it does not synthesize empty days or `NOT_ENTERED` cells. Add a timetable/academic-calendar service if the UI needs a complete calendar grid.
- Calendar and exam routes read database data; insert your actual events and exam timetable.
- The frontend's current ForgotPassword.tsx is only a UI placeholder. Wire its submit to `POST /api/auth/forgot-password`, and build a reset page that reads `token` from the query string and calls `POST /api/auth/reset-password`.
- SendGrid requires a verified sender identity. Password reset uses a 30-minute, single-use token; unknown email addresses get the same accepted response.
- Remove/disable demo seeding before production. Add admin-only roster/class/subject/event/exam management, rate limiting, audit logging, HTTPS, and secret rotation before public deployment.
