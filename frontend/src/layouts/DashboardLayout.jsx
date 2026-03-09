import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-[#071a2f] text-white">
      <Sidebar />
      <div className="ml-[260px] flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
}
