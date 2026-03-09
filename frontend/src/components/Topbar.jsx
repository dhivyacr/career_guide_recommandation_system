import { FiBell, FiHelpCircle, FiSearch } from "react-icons/fi";

function Topbar() {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full max-w-2xl">
        <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8da7c9]" />
        <input
          type="text"
          placeholder="Search resources, jobs, or mentors..."
          className="w-full rounded-xl border border-white/10 bg-[#0f2747] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/70 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-xl border border-white/10 bg-[#0f2747] p-2.5 text-[#c7d6eb] transition hover:text-white"
          aria-label="Notifications"
        >
          <FiBell />
        </button>
        <button
          type="button"
          className="rounded-xl border border-white/10 bg-[#0f2747] p-2.5 text-[#c7d6eb] transition hover:text-white"
          aria-label="Help"
        >
          <FiHelpCircle />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
