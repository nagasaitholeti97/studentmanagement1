
import { Navigate, Route, Routes } from "react-router-dom";
import { homeFor, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import FacultyLayout from "./components/FacultyLayout";
import PortalLayout from "./components/PortalLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfilePage from "./pages/student/StudentProfilePage";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentCalendar from "./pages/student/StudentCalendar";

import FacultyProfilePage from "./pages/faculty/FacultyProfilePage";
import ClassesAttending from "./pages/faculty/ClassesAttending";
import ClassDetail from "./pages/faculty/ClassDetail";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";

const studentNav = [
  { to: "/student", label: "Dashboard", end: true },
  { to: "/student/profile", label: "Profile" },
  { to: "/student/attendance", label: "Attendance" },
  { to: "/student/calendar", label: "Academic calendar" },
];

export default function App() {
  const { role } = useAuth();

  return (
    <Routes>
      {/* Home */}
      <Route
        path="/"
        element={
          <Navigate
            to={role ? homeFor(role) : "/login"}
            replace
          />
        }
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          role
            ? <Navigate to={homeFor(role)} replace />
            : <Login />
        }
      />

      {/* Common Registration - Faculty & Student */}
      <Route
        path="/register"
        element={
          role
            ? <Navigate to={homeFor(role)} replace />
            : <Register />
        }
      />

      {/* Forgot Password */}
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* Student Routes */}
      <Route element={<ProtectedRoute role="STUDENT" />}>
        <Route
          path="/student"
          element={
            <PortalLayout
              title="Student portal"
              nav={studentNav}
            />
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route
            path="profile"
            element={<StudentProfilePage />}
          />
          <Route
            path="attendance"
            element={<StudentAttendance />}
          />
          <Route
            path="calendar"
            element={<StudentCalendar />}
          />
        </Route>
      </Route>

      {/* Faculty Routes */}
      <Route element={<ProtectedRoute role="FACULTY" />}>
        <Route
          path="/faculty"
          element={<FacultyLayout />}
        >
          <Route index element={<FacultyDashboard />} />
          <Route
            path="profile"
            element={<FacultyProfilePage />}
          />
          <Route
            path="classes"
            element={<ClassesAttending />}
          />
          <Route
            path="classes/:classId"
            element={<ClassDetail />}
          />
        </Route>
      </Route>

      {/* Unknown Routes */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
