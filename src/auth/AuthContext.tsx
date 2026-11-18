import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../api";
import { tokenStore } from "../api/client";
import type { Role } from "../types";

const ROLE_KEY = "sams_role";
export const homeFor = (role: Role) => (role === "STUDENT" ? "/student" : "/faculty");

interface AuthState {
  role: Role | null;
  signIn: (identifier: string, password: string) => Promise<Role>;
  signOut: () => void;
}
const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(() =>
    tokenStore.get() ? (sessionStorage.getItem(ROLE_KEY) as Role | null) : null
  );

  const signOut = useCallback(() => {
    tokenStore.clear();
    sessionStorage.removeItem(ROLE_KEY);
    setRole(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  // The API client fires this when the backend rejects an expired / invalid JWT.
  useEffect(() => {
    window.addEventListener("auth:expired", signOut);
    return () => window.removeEventListener("auth:expired", signOut);
  }, [signOut]);

  const signIn = useCallback(async (identifier: string, password: string) => {
    const res = await api.login(identifier, password);
    tokenStore.set(res.token);
    sessionStorage.setItem(ROLE_KEY, res.role);
    setRole(res.role);
    return res.role;
  }, []);

  const value = useMemo(() => ({ role, signIn, signOut }), [role, signIn, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
