import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";

function AppLayout({ children }) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isDashboardRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/student-dashboard") ||
    location.pathname.startsWith("/profile") ||
    location.pathname === "/career" ||
    location.pathname.startsWith("/career/") ||
    location.pathname.startsWith("/career-mentor") ||
    location.pathname.startsWith("/portfolio") ||
    location.pathname.startsWith("/settings") ||
    location.pathname.startsWith("/student-profile") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/mentor-dashboard");
  const useFluidMain = isLoginPage || isDashboardRoute;

  return (
    <div className="min-h-screen bg-ai-bg text-ai-text">
      {!useFluidMain ? <Navbar /> : null}
      <main className={useFluidMain ? "min-h-screen" : "mx-auto min-h-screen max-w-7xl px-4 pb-6 pt-20 sm:px-6 lg:px-8"}>
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
