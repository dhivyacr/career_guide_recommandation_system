import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import SkillBar from "./SkillBar";

function SkillGapPanel({ items }) {
  const chartData = items.map((item) => ({
    skill: item.skill.length > 14 ? `${item.skill.slice(0, 14)}...` : item.skill,
    level: item.percentage,
    fullSkill: item.skill
  }));

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]">
      <div>
        <h3 className="text-xl font-semibold text-white">Skill Gap Analysis</h3>
        <p className="mt-1 text-sm text-slate-400">See where your readiness is strongest and where focused practice will help most.</p>
      </div>

      <div className="mt-5 h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
            <XAxis dataKey="skill" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.92)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                color: "#e5e7eb"
              }}
              formatter={(value, _name, context) => [`${value}%`, context.payload.fullSkill]}
            />
            <Bar dataKey="level" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.fullSkill}
                  fill={
                    entry.level < 50
                      ? "#fb923c"
                      : entry.level > 80
                        ? "#34d399"
                        : "#3b82f6"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <SkillBar key={item.skill} skill={item.skill} percentage={item.percentage} />
        ))}
      </div>
    </section>
  );
}

export default SkillGapPanel;
