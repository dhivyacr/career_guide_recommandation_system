import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";

function AppLayout({ children }) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isStudentDashboardRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/profile") ||
    location.pathname === "/career" ||
    location.pathname.startsWith("/career/") ||
    location.pathname.startsWith("/settings") ||
    location.pathname.startsWith("/student-profile");
  const useFluidMain = isLoginPage || isStudentDashboardRoute;

  return (
    <div className="min-h-screen bg-ai-bg text-ai-text">
      {!useFluidMain ? <Navbar /> : null}
      <main className={useFluidMain ? "min-h-screen" : "mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"}>{children}</main>
    </div>
  );
}

export default AppLayout;
