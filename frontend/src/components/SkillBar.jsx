function SkillBar({ skill, percentage = 0 }) {
  const value = Math.max(0, Math.min(100, Number(percentage) || 0));

  let fillClass = "bg-blue-500";
  if (value < 50) {
    fillClass = "bg-orange-400";
  } else if (value > 80) {
    fillClass = "bg-emerald-400";
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm text-[#d5e2f5]">
        <span>{skill}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className={`h-2 rounded-full ${fillClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default SkillBar;
