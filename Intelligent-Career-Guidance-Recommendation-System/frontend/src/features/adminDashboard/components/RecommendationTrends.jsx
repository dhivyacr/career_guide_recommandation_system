const sectors = ["Marketing", "Design", "Engineering", "Healthcare", "Sales", "Legal"];

function RecommendationTrends() {
  return (
    <section className="card-container rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Career Recommendation Trends</h2>
          <p className="mt-1 text-sm text-ai-text/70">Distribution across major sectors this quarter</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="rounded-xl border border-blue-300/30 px-3 py-2 text-xs text-ai-text/80 hover:bg-blue-500/10">
            Monthly
          </button>
          <button type="button" className="rounded-xl bg-ai-accent px-3 py-2 text-xs font-semibold text-white shadow-glow">
            Quarterly
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sectors.map((sector, index) => (
          <div key={sector} className="rounded-2xl border border-blue-300/20 bg-[#112944] p-4 transition hover:border-blue-400/50 hover:shadow-glow">
            <p className="text-sm text-ai-text/80">{sector}</p>
            <div className="mt-3 h-2 rounded-full bg-[#0d223a]">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                style={{ width: `${35 + index * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecommendationTrends;
