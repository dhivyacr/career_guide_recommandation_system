const menuItems = ["Overview", "Users", "Career Data", "Settings", "Support"];

function SidebarNavigation() {
  return (
    <aside className="card-container flex h-full flex-col rounded-3xl bg-ai-secondary/70 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-blue-300/90">Career Admin</p>
        <h2 className="mt-1 text-xl font-bold text-white">Management Portal</h2>
      </div>

      <nav className="mt-8 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item}
            type="button"
            className={`w-full rounded-xl px-4 py-2.5 text-left text-sm transition ${
              item === "Overview"
                ? "bg-ai-accent text-white shadow-glow"
                : "text-ai-text/80 hover:bg-blue-500/15 hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-blue-300/20 bg-ai-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/25 text-sm font-semibold text-blue-100">
            AO
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Alex Ops</p>
            <p className="text-xs text-ai-text/70">Head of Ops</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default SidebarNavigation;
