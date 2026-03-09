import { NavLink, useNavigate } from "react-router-dom";
import { FiGrid, FiUser, FiMap, FiLogOut } from "react-icons/fi";

function Sidebar({ title = "Menu", active = "", role: roleProp, variant = "default" }) {
  const navigate = useNavigate();
  const role = roleProp || localStorage.getItem("role") || "student";

  if (variant === "studentDashboard" || (variant === "default" && role === "student")) {
    const profile = JSON.parse(localStorage.getItem("studentProfile") || "{}");
    const displayName = profile.name || localStorage.getItem("userName") || "Alex Johnson";
    const displayProgram = profile.degree || "Computer Science";
    const initials = displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const links = [
      { label: "Dashboard", icon: FiGrid, to: "/dashboard" },
      { label: "Profile", icon: FiUser, to: "/profile" },
      { label: "Career", icon: FiMap, to: "/career" }
    ];

    function handleLogout() {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      navigate("/login", { replace: true });
    }

    return (
      <aside className="fixed left-0 top-0 flex h-screen w-[260px] flex-col justify-between border-r border-white/5 bg-[#0f2747] p-4 shadow-[0_0_35px_rgba(59,130,246,0.14)]">
        <div>
          <div className="rounded-xl border border-white/10 bg-[#112f53] px-4 py-3">
            <p className="text-lg font-semibold text-white">CareerGuide AI</p>
          </div>

          <nav className="mt-6 space-y-2">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={`${item.label}-${item.to}`}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition ${
                      isActive ? "bg-[#3b82f6] text-white" : "text-[#c7d6eb] hover:bg-white/5"
                    }`
                  }
                >
                  <Icon className="text-base" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-[#112f53] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3b82f6]/25 text-sm font-semibold text-white">
                {initials || "AJ"}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{displayName}</p>
                <p className="text-xs text-[#b4c3d9]">{displayProgram}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-3 py-2 text-sm text-[#d7e6ff] hover:bg-blue-500/20"
          >
            <FiLogOut />
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
    navigate("/login", { replace: true });
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
