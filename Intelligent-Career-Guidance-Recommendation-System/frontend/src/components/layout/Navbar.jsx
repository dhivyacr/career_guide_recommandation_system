import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const links = [
    { name: "Features", to: "#features" },
    { name: "How it Works", to: "#how-it-works" },
    { name: "Pricing", to: "#pricing" }
  ];

  return (
    <header className="glass-nav sticky top-0 z-40">
      <div className="section-shell flex h-20 items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-white">
          Career<span className="text-ai-accent">AI</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-ai-text/90 md:flex">
          {links.map((link) => (
            <a key={link.name} href={link.to} className="transition hover:text-white">
              {link.name}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <NavLink to="/login" className="rounded-xl border border-blue-300/30 px-4 py-2 text-sm hover:bg-blue-500/10">
            Login
          </NavLink>
          <NavLink to="/register" className="button-gradient text-sm">
            Register
          </NavLink>
        </div>

        <button
          type="button"
          className="rounded-lg border border-blue-300/30 px-3 py-2 text-sm text-ai-text md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="section-shell pb-4 md:hidden">
          <div className="card-container space-y-3 p-4">
            {links.map((link) => (
              <a key={link.name} href={link.to} className="block text-sm text-ai-text/90 hover:text-white">
                {link.name}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <NavLink to="/login" className="rounded-xl border border-blue-300/30 px-4 py-2 text-sm hover:bg-blue-500/10">
                Login
              </NavLink>
              <NavLink to="/register" className="button-gradient text-sm">
                Register
              </NavLink>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
