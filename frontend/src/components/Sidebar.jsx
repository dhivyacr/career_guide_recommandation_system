import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { FiAward, FiBriefcase, FiFileText, FiGrid, FiLogOut, FiMap, FiMessageSquare, FiSettings, FiUser, FiUsers } from "react-icons/fi";

function Sidebar({
  title = "Menu",
  active = "",
  role: roleProp,
  variant = "default",
  isOpen = false,
  onNavigate
}) {
  const navigate = useNavigate();
  const role = roleProp || localStorage.getItem("role") || "student";

  if (variant === "dashboard" || variant === "studentDashboard" || (variant === "default" && (role === "student" || role === "admin"))) {
    const profile = JSON.parse(localStorage.getItem("studentProfile") || "{}");
    const isAdmin = role === "admin";
    const displayName = isAdmin
      ? localStorage.getItem("userName") || "Admin User"
      : profile.name || localStorage.getItem("userName") || "Alex Johnson";
    const displayProgram = isAdmin ? "Platform Administrator" : profile.degree || "B.S. Computer Science";
    const initials = displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const links = isAdmin
      ? [
          { label: "Dashboard", icon: FiGrid, to: "/admin-dashboard" },
          { label: "Leaderboard", icon: FiAward, to: "/admin/leaderboard" },
          { label: "Students", icon: FiUsers, to: "/admin/students" },
          { label: "Reports", icon: FiFileText, to: "/admin/reports" },
          { label: "Settings", icon: FiSettings, to: "/admin/settings" }
        ]
      : [
          { label: "Dashboard", icon: FiGrid, to: "/dashboard" },
          { label: "Profile", icon: FiUser, to: "/profile" },
          { label: "Portfolio", icon: FiMap, to: "/portfolio" },
          { label: "Career Recommendations", icon: FiBriefcase, to: "/career" },
          { label: "Career Mentor", icon: FiMessageSquare, to: "/career-mentor" },
          { label: "Settings", icon: FiSettings, to: "/settings" }
        ];

    function handleLogout() {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("studentProfile");
      navigate("/login");
    }

    return (
      <aside
        className={`dashboard-sidebar fixed left-0 top-0 z-[1000] flex h-screen w-[260px] flex-col overflow-y-auto border-r border-white/10 bg-[linear-gradient(180deg,#0f172a,#1e293b)] px-5 py-7 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 shadow-2xl backdrop-blur-xl">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-semibold text-slate-950 shadow-[0_0_24px_rgba(59,130,246,0.45)] ${
                isAdmin ? "bg-gradient-to-br from-cyan-300 to-blue-500" : "bg-gradient-to-br from-blue-400 to-cyan-300"
              }`}
            >
              {isAdmin ? "A" : "E"}
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{isAdmin ? "Admin Hub" : "EduPath"}</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {isAdmin ? "Control Center" : "Student Portal"}
              </p>
            </div>
          </div>

          <nav className="mt-[30px] flex flex-col gap-[14px]">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={`${item.label}-${item.to}`}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                >
                  <NavLink
                    to={item.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-[14px] rounded-xl px-4 py-3 no-underline transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
                          : "text-slate-300 hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                </motion.div>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto space-y-[10px] pt-6">
          <div className="rounded-[14px] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                {initials || (isAdmin ? "AU" : "AJ")}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{displayName}</p>
                <p className="text-xs text-slate-400">{displayProgram}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] bg-white/5 px-4 py-[10px] text-sm text-slate-200 transition-colors duration-200 hover:bg-[rgba(255,255,255,0.08)]"
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    );
  }

  if (variant === "studentProfile") {
    const menuItems = [
      { label: "Dashboard", icon: FiGrid },
      { label: "Student Profile", icon: FiUser },
      { label: "Career Paths", icon: FiMap }
    ];

    return (
      <aside className="flex h-full min-h-fit w-full flex-col justify-between rounded-2xl border border-white/5 bg-[#0f2747] p-4 shadow-[0_0_35px_rgba(59,130,246,0.18)] lg:min-h-[calc(100vh-3rem)] lg:w-[260px]">
        <div>
          <div className="rounded-xl border border-white/5 bg-[#112f53] px-3 py-3">
            <p className="text-lg font-semibold text-white">CareerGuide AI</p>
          </div>

          <nav className="mt-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.label === active;
              return (
                <button
                  key={item.label}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-left text-sm transition ${
                    isActive ? "bg-[#3b82f6] text-white" : "text-[#c7d6eb] hover:bg-white/5"
                  }`}
                >
                  <Icon className="text-base" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

        </div>

        <div className="rounded-xl border border-white/10 bg-[#112f53] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3b82f6]/25 text-sm font-semibold text-white">
              AJ
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Alex Johnson</p>
              <p className="text-xs text-[#b4c3d9]">Computer Science</p>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const items =
    role === "admin" ? ["Overview", "Users", "Career Data", "Analytics"] : ["Dashboard", "Profile", "Careers", "Skill Gap"];

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  }

  return (
    <aside className="glow-card flex h-fit flex-col p-4">
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className={`rounded-lg px-3 py-2 text-sm ${
              item === active ? "bg-ai-accent text-white" : "text-ai-text/80 hover:bg-blue-500/10"
            }`}
          >
            {item}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-6 rounded-lg border border-blue-400/30 px-3 py-2 text-sm text-ai-text hover:bg-blue-500/10"
      >
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
