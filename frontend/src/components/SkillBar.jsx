function SkillBar({ skill, percentage = 0 }) {
  const value = Math.max(0, Math.min(100, Number(percentage) || 0));

  let fillClass = "bg-gradient-to-r from-blue-400 to-cyan-400";
  if (value < 50) {
    fillClass = "bg-gradient-to-r from-orange-400 to-amber-300";
  } else if (value > 80) {
    fillClass = "bg-gradient-to-r from-emerald-400 to-green-300";
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm text-[#d5e2f5]">
        <span>{skill}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full rounded-full bg-slate-800 h-2">
        <div className={`h-2 rounded-full ${fillClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default SkillBar;
