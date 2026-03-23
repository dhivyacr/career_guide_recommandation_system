function WeeklyGoal({ weeklyGoal, onToggleGoal, updatingGoalIds = [] }) {
  const goals = weeklyGoal?.goals || [];
  const completed = weeklyGoal?.completed || 0;
  const total = weeklyGoal?.total || goals.length || 0;
  const progress = weeklyGoal?.progress || 0;
  const message = weeklyGoal?.message || "";
  const targetText = weeklyGoal?.targetText || "Weekly learning goals will appear from your current skill gaps.";

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Weekly Goal</h3>
          <p className="mt-2 text-sm leading-7 text-slate-300">{targetText}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#081323]/80 px-4 py-3 text-right">
          <p className="text-sm font-medium text-white">
            {completed} / {total} completed
          </p>
          <p className="mt-1 text-xs text-slate-400">{progress}%</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
          <span>
            {completed} / {total} completed
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-800/90">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {goals.length ? (
          goals.map((goal) => {
            const isUpdating = updatingGoalIds.includes(goal._id);

            return (
              <label
                key={goal._id}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0a1628]/80 px-4 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={goal.completed}
                  disabled={isUpdating}
                  onChange={(event) => onToggleGoal(goal._id, event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-400"
                />
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${goal.completed ? "text-slate-400 line-through" : "text-white"}`}>
                    {goal.goalTitle}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-300">{goal.skill}</p>
                </div>
              </label>
            );
          })
        ) : (
          <p className="rounded-2xl border border-white/10 bg-[#0a1628]/80 px-4 py-3 text-sm text-slate-300">
            No weekly goals available right now.
          </p>
        )}
      </div>

      {message ? <p className="mt-4 text-sm font-medium text-emerald-300">{message}</p> : null}
    </section>
  );
}

export default WeeklyGoal;
