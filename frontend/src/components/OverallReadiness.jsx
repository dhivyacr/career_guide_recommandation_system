import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

function OverallReadiness({ value = 70 }) {
  const normalized = Math.max(0, Math.min(100, value));
  const readinessData = [{ name: "Readiness", value: normalized, fill: "#3b82f6" }];

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]">
      <h3 className="text-xl font-semibold text-white">Overall Readiness</h3>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative h-48 w-full max-w-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={readinessData}
              startAngle={180}
              endAngle={0}
              barSize={18}
            >
              <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "rgba(148,163,184,0.15)" }} />
            </RadialBarChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="mt-8 text-center">
              <p className="text-3xl font-semibold text-white">{normalized}%</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">Readiness</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-6 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          Generate Detailed Report
        </button>
      </div>
    </section>
  );
}

export default OverallReadiness;
