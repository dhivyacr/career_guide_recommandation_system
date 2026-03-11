function WeeklyGoal({ completed = 2, total = 3, targetText = "Complete 3 modules in Cloud Infrastructure to reach 80%." }) {
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]">
      <h3 className="text-xl font-semibold text-white">Weekly Goal</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        {targetText}
      </p>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
          <span>{completed}/{total} completed</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800">
          <div className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>
  );
}

export default WeeklyGoal;
