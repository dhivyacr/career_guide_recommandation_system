function DashboardHeader() {
  return (
    <header className="card-container flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      <div className="flex w-full items-center gap-3 sm:w-auto">
        <input
          type="text"
          placeholder="Search data..."
          className="w-full rounded-xl border border-blue-300/25 bg-[#102743] px-4 py-2.5 text-sm text-ai-text outline-none placeholder:text-ai-text/50 focus:border-ai-accent sm:w-72"
        />
        <button
          type="button"
          className="rounded-xl border border-blue-300/30 bg-[#102743] px-3 py-2 text-xs font-semibold text-ai-text hover:bg-blue-500/10"
        >
          NOTIF
        </button>
        <button
          type="button"
          className="rounded-xl border border-blue-300/30 bg-[#102743] px-3 py-2 text-xs font-semibold text-ai-text hover:bg-blue-500/10"
        >
          GRID
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
