import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout({ title, children }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-400">AI Intelligent Career Guidance</p>
            <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <span>{user?.name || "User"}</span>
            <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sky-300">{role}</span>
            <button type="button" onClick={handleLogout} className="rounded-lg border border-slate-700 px-3 py-2 hover:bg-slate-800">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}

export default Layout;
