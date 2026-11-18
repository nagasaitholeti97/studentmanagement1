import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface Props { title: string; nav: { to: string; label: string; end?: boolean }[] }

export default function PortalLayout({ title, nav }: Props) {
  const { signOut } = useAuth();
  const link = ({ isActive }: { isActive: boolean }) =>
    `block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-white text-ink" : "text-blue-100 hover:bg-white/10"
    }`;

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-ink md:w-60 md:shrink-0 print:hidden">        <div className="flex items-center justify-between px-5 py-4 md:block">
        <p className="text-base font-bold text-white">Attendance</p>
        <p className="text-xs text-blue-200">{title}</p>
      </div>
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:pb-0">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={link}>{n.label}</NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between print:hidden border-b border-slate-200 bg-white px-6 py-3">          <h1 className="text-sm font-semibold text-slate-600">{title}</h1>
          <button onClick={signOut} className="btn-ghost !py-1.5">Log out</button>
        </header>
        <main className="mx-auto max-w-6xl p-6"><Outlet /></main>      </div>
    </div>
  );
}
