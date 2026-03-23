import { useState } from "react";
import GaugeChart from "react-gauge-chart";
import { FiInfo } from "react-icons/fi";

function OverallReadiness({ readinessScore = 0, breakdown = {}, onGenerateReport, isGeneratingReport = false }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const normalized = Math.max(0, Math.min(100, readinessScore));

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-semibold text-white">Overall Readiness</h3>
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            type="button"
            className="rounded-full border border-white/10 bg-[#081323]/80 p-2 text-slate-300 transition hover:bg-white/10"
            aria-label="Readiness score explanation"
          >
            <FiInfo />
          </button>

          {showTooltip ? (
            <div className="absolute right-0 top-12 z-10 w-56 rounded-2xl border border-white/10 bg-[#081323]/95 p-4 text-xs text-slate-300 shadow-2xl">
              <p className="font-semibold text-white">Readiness Breakdown</p>
              <p className="mt-2">Skill Match → {breakdown.skillMatch ?? 0}%</p>
              <p className="mt-1">Goal Completion → {breakdown.goalCompletion ?? 0}%</p>
              <p className="mt-1">Profile → {breakdown.profileCompletion ?? 0}%</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative w-full max-w-[260px]">
          <GaugeChart
            id="readiness-gauge"
            nrOfLevels={20}
            percent={normalized / 100}
            arcsLength={[0.5, 0.3, 0.2]}
            colors={["#ef4444", "#f59e0b", "#36d399"]}
            arcPadding={0.02}
            cornerRadius={8}
            needleColor="#e5e7eb"
            needleBaseColor="#94a3b8"
            textColor="transparent"
            animate
          />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="mt-10 text-center">
              <p className="text-3xl font-semibold text-white">{normalized}%</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">Readiness</p>
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm font-medium text-slate-200">Career Readiness: {normalized}%</p>

        <button
          type="button"
          onClick={onGenerateReport}
          disabled={isGeneratingReport}
          className="mt-6 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-500/60"
        >
          {isGeneratingReport ? "Generating..." : "Generate Detailed Report"}
        </button>
      </div>
    </section>
  );
}

export default OverallReadiness;
