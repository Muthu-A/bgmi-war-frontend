import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Gamepad2, Swords, LogOut } from "lucide-react";
import HeaderSeasonMenu from "./HeaderSeasonMenu";

export default function Layout({ children }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isAdmin = localStorage.getItem("role");
  // Helper to check if a path is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-900 text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 flex flex-col border-r border-slate-700">
        {/* Logo Section */}
        <div className="p-6">
          <h1 className="text-xl font-black tracking-tighter text-green-400 flex items-center gap-2">
            <Swords size={28} />
            BOT SQUAD WAR
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-2">
          <NavItem
            to="/dashboard"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={isActive("/dashboard")}
          />
          {isAdmin === "admin" && (
            <NavItem
              to="/teams"
              icon={<Users size={20} />}
              label="Teams"
              active={isActive("/teams")}
            />
          )}
          <NavItem
            to="/matches"
            icon={<Gamepad2 size={20} />}
            label="Matches History"
            active={isActive("/matches")}
          />
          <NavItem
            to="/today-war"
            icon={<Swords size={20} />}
            label="Today's War"
            active={isActive("/today-war")}
          />
        </nav>

        {/* Bottom Section (Optional Logout/Profile) */}
        <div className="p-4 border-t border-slate-700">
          <button
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 transition-colors"
            onClick={() => {
              // Clear token and role from localStorage
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              // Redirect to login
              window.location.href = "/login";
            }}
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header (Optional placeholder for search/profile) */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-8 justify-end">
          <HeaderSeasonMenu isOpen={open} />
          {/* Profile Section */}
          <div
            className="flex items-center gap-3 hover:bg-slate-800/50 p-2 rounded-lg transition-colors cursor-pointer group"
            onClick={() => {
              if (isAdmin === "admin") setOpen(!open);
            }}
          >
            {/* Text Info - Name and Role */}
            <div className="text-right flex flex-col">
              <span className="text-sm font-bold text-slate-200 group-hover:text-green-400 transition-colors">
                IGL Madan
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                BOT Squad Leader
              </span>
            </div>

            {/* Avatar Icon */}
            <div className="w-9 h-9 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-xs font-bold text-green-400 shadow-lg shadow-green-500/10">
              IM
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto bg-[#0f172a]">
          {children}
        </div>
      </main>
    </div>
  );
}

// Sub-component for individual Nav Links
function NavItem({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
        ${
          active
            ? "bg-green-500/10 text-green-400 border-l-4 border-green-500 shadow-lg shadow-green-500/5"
            : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
        }
      `}
    >
      <span
        className={`${active ? "text-green-400" : "group-hover:text-green-400 transition-colors"}`}
      >
        {icon}
      </span>
      <span className="font-semibold text-sm">{label}</span>
    </Link>
  );
}
