function AdminGuidance({ note, entries = [] }) {
  const guidanceEntries = Array.isArray(entries) ? entries.filter((entry) => entry?.message) : [];

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]">
      <h3 className="text-xl font-semibold text-white">Admin Guidance</h3>
      <article className="mt-4 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Mentor Feedback</p>
        {guidanceEntries.length ? (
          <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
            {guidanceEntries
              .slice()
              .reverse()
              .map((entry, index) => (
                <li key={`${entry.date || "entry"}-${index}`} className="flex gap-2">
                  <span className="text-slate-500">•</span>
                  <span>{entry.message}</span>
                </li>
              ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {note ||
              "Students with strong frontend skills should focus on mastering JavaScript frameworks, system design, and building real-world projects to improve employability in full-stack roles."}
          </p>
        )}
      </article>
    </section>
  );
}

export default AdminGuidance;
