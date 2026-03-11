import { FiEdit3, FiExternalLink } from "react-icons/fi";

function StudentOverview({ profile }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/25 to-cyan-400/20 text-xl font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.25)]">
            {String(profile.name || "AJ")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Student Overview</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">{profile.name}</h2>
            <p className="text-sm text-slate-400">{profile.degree}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-1">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">GPA</p>
            <p className="mt-2 text-base font-medium text-white">{profile.gpa}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600">
          <FiEdit3 />
          Edit Profile
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
        >
          <FiExternalLink />
          View Portfolio
        </button>
      </div>
    </section>
  );
}

export default StudentOverview;
