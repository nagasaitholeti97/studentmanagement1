import { Navigate, Outlet } from "react-router-dom";
import { homeFor, useAuth } from "./AuthContext";
import type { Role } from "../types";

/** Blocks anyone who is not signed in, and sends a user with the wrong role to their own portal. */
export default function ProtectedRoute({ role }: { role: Role }) {
  const { role: current } = useAuth();
  if (!current) return <Navigate to="/login" replace />;
  if (current !== role) return <Navigate to={homeFor(current)} replace />;
  return <Outlet />;
}
