import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const linkClass = ({ isActive }) =>
    `rounded-lg border px-3 py-1.5 text-sm transition ${
      isActive
        ? "border-blue-400/50 bg-blue-500/20 text-white"
        : "border-blue-400/20 text-ai-text hover:bg-blue-500/10"
    }`;

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    navigate("/", { replace: true });
  }

  const isLanding = location.pathname === "/";

  return (
    <header className="sticky top-0 z-30 border-b border-blue-400/20 bg-[#0b1d33]/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-bold text-white">
          Intelligent Career <span className="text-ai-accent">Guidance</span>
        </Link>

        {isLanding ? (
          <nav className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-lg border border-blue-400/20 px-3 py-1.5 text-sm hover:bg-blue-500/10"
            >
              Features
            </button>
            <button type="button" onClick={() => navigate("/login")} className={linkClass({ isActive: false })}>
              Login
            </button>
          </nav>
        ) : (
          <nav className="flex flex-wrap gap-2">
            {!token ? (
              <button type="button" onClick={() => navigate("/login")} className={linkClass({ isActive: false })}>
                Login
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-blue-400/20 px-3 py-1.5 text-sm text-ai-text hover:bg-blue-500/10"
              >
                Logout
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

export default Navbar;
