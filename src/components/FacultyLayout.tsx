import { useState } from "react";
import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import { getFacultyProfile } from "../api";
import { useAuth } from "../auth/AuthContext";
import { useAsync } from "../lib/useAsync";
import type { FacultyProfile } from "../types";
import { ErrorBox, Loading } from "./ui";

/** Shared with the faculty pages through the router, so the profile is fetched once. */
export interface FacultyCtx { profile: FacultyProfile; setProfile: (p: FacultyProfile) => void }
export const useFaculty = () => useOutletContext<FacultyCtx>();

const NAV: { to: string; label: string; end?: boolean }[] = [
    { to: "/faculty", label: "Dashboard", end: true },
    { to: "/faculty/profile", label: "Profile" },
    { to: "/faculty/classes", label: "Classes attending" },
];

export default function FacultyLayout() {
    const { signOut } = useAuth();
    const { data, error, loading } = useAsync(getFacultyProfile);
    const [updated, setUpdated] = useState<FacultyProfile | null>(null);
    const profile = updated ?? data;

    if (loading) return <div className="mx-auto max-w-5xl p-6"><Loading /></div>;
    if (error || !profile) {
        return (
            <div className="mx-auto max-w-5xl space-y-3 p-6">
                <ErrorBox message={error ?? "Profile not found."} />
                <button className="btn-ghost" onClick={signOut}>Log out</button>
            </div>
        );
    }

    const link = ({ isActive }: { isActive: boolean }) =>
        `block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-white text-ink" : "text-blue-100 hover:bg-white/10"}`;

    return (
        <div className="min-h-screen md:flex">
            <aside className="bg-ink md:w-60 md:shrink-0 print:hidden">
                <div className="flex items-center justify-between px-5 py-4 md:block">
                    <p className="text-base font-bold text-white">Attendance</p>
                    <p className="text-xs text-blue-200">Faculty portal</p>
                </div>
                <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:pb-0">
                    {NAV.map((n) => (
                        <NavLink key={n.to} to={n.to} end={n.end} className={link}>{n.label}</NavLink>
                    ))}
                </nav>
            </aside>

            <div className="flex-1">
                <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 print:hidden">
                    <h1 className="text-sm font-semibold text-slate-600">Faculty portal</h1>
                    <button onClick={signOut} className="btn-ghost !py-1.5">Log out</button>
                </header>
                <main className="mx-auto max-w-6xl p-6">
                    <Outlet context={{ profile, setProfile: setUpdated } satisfies FacultyCtx} />
                </main>
            </div>
        </div>
    );
}