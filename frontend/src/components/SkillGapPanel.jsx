import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const LEGEND_ITEMS = [
  { label: "Strong Skill", color: "#34d399" },
  { label: "Needs Improvement", color: "#fbbf24" },
  { label: "Skill Gap", color: "#f97316" }
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload[0]?.payload;
  if (!entry) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#081323]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="text-sm font-semibold text-white">{entry.fullSkill}</p>
      <p className="mt-1 text-sm text-[#dce9fb]">{entry.score}% match to required level</p>
      <p className="mt-1 text-xs text-slate-400">
        Student level: {entry.studentSkillLevel} / Required level: {entry.requiredSkillLevel}
      </p>
      <p className="mt-2 text-xs font-medium" style={{ color: entry.color }}>
        {entry.status}
      </p>
    </div>
  );
}

function SkillGapPanel({ items }) {
  const chartData = [...items]
    .sort((left, right) => {
      const leftScore = Number(left.score ?? left.percentage ?? 0);
      const rightScore = Number(right.score ?? right.percentage ?? 0);
      return rightScore - leftScore;
    })
    .map((item) => ({
      skill: item.skill.length > 12 ? `${item.skill.slice(0, 12)}...` : item.skill,
      fullSkill: item.skill,
      score: Number(item.score ?? item.percentage ?? 0),
      studentSkillLevel: Number(item.studentSkillLevel ?? item.score ?? item.percentage ?? 0),
      requiredSkillLevel: Number(item.requiredSkillLevel ?? 100),
      status: item.status || "Needs Improvement",
      color: item.color || "#fbbf24"
    }));

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Skill Gap Analysis</h3>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Current skills are compared against the required level for your best-fit role and ranked from strongest to weakest.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#09172a]/80 px-4 py-3">
          <div className="space-y-2">
            {LEGEND_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs text-[#dce9fb]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 18, right: 18, left: -18, bottom: 10 }} barCategoryGap={18}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
            <XAxis dataKey="skill" stroke="#9fb4d1" tickLine={false} axisLine={false} fontSize={11} interval={0} />
            <YAxis
              domain={[0, 100]}
              stroke="#9fb4d1"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<CustomTooltip />} />
            <Legend content={() => null} />
            <Bar dataKey="score" radius={[10, 10, 0, 0]} animationDuration={500}>
              {chartData.map((entry) => (
                <Cell key={entry.fullSkill} fill={entry.color} />
              ))}
              <LabelList
                dataKey="score"
                position="top"
                formatter={(value) => `${value}%`}
                fill="#e7f0ff"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default SkillGapPanel;
