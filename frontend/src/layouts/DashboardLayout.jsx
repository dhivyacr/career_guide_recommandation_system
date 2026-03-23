import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout({ role = "student" }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("studentProfile");
    navigate("/login");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-[#e5e7eb]">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-[999] bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
        />
      ) : null}

      <Sidebar
        variant="dashboard"
        role={role}
        isOpen={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      <header
        className={`fixed left-0 right-0 top-0 z-[998] border-b border-white/10 bg-slate-950/75 px-6 py-4 shadow-2xl backdrop-blur-xl transition-[padding,left] duration-300 lg:px-8 ${
          sidebarOpen ? "lg:left-[260px]" : "lg:left-0"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((current) => !current)}
              className="rounded-lg border border-white/10 bg-transparent p-2 text-white transition hover:bg-white/10"
              aria-label="Toggle sidebar"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <h1 className="flex-1 truncate text-lg font-semibold text-white sm:text-xl">
              Intelligent Career Guidance
            </h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </header>

      <main
        className={`relative min-h-screen overflow-y-auto px-6 pb-8 pt-24 transition-[margin] duration-300 lg:px-8 ${
          sidebarOpen ? "lg:ml-[260px]" : "ml-0"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
