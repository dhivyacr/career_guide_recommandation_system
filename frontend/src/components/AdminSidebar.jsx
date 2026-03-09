import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    navigate("/login", { replace: true });
  }

  return (
    <aside className="w-[230px] rounded-2xl border border-white/5 bg-[#0f2747] p-4 shadow-[0_0_28px_rgba(59,130,246,0.14)]">
      <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
      <nav className="mt-5 space-y-2">
        <NavLink
          to="/admin-dashboard"
          className={({ isActive }) =>
            `block w-full rounded-full px-4 py-2.5 text-left text-sm ${
              isActive ? "bg-[#3b82f6] text-white" : "text-[#c7d6eb] hover:bg-white/5"
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/students"
          className={({ isActive }) =>
            `block w-full rounded-full px-4 py-2.5 text-left text-sm ${
              isActive ? "bg-[#3b82f6] text-white" : "text-[#c7d6eb] hover:bg-white/5"
            }`
          }
        >
          Students
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-full px-4 py-2.5 text-left text-sm text-[#c7d6eb] hover:bg-white/5"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
