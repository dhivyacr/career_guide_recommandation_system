import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function StudentDashboardLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-[#e5e7eb]">
      <Sidebar variant="studentDashboard" />
      <main className="ml-64 min-h-screen px-6 py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentDashboardLayout;
