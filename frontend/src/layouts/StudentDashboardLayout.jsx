import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function StudentDashboardLayout() {
  return (
    <div className="min-h-screen bg-[#071a2f] text-[#e5e7eb]">
      <Sidebar variant="studentDashboard" />
      <main className="ml-[260px] min-h-screen px-6 py-6">
        <Topbar />
        <div className="mt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default StudentDashboardLayout;
