import CareerCard from "./CareerCard";

function CareerRecommendations({ recommendations }) {
  return (
    <section className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]">
      <div>
        <h3 className="text-xl font-semibold text-white">Career Recommendations</h3>
        <p className="mt-1 text-sm text-slate-400">Top 5 career matches based on your current skills and saved profile.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {recommendations.map((career, index) => (
          <CareerCard key={`${career.careerName}-${index}`} career={career} isBestMatch={index === 0} />
        ))}
      </div>
    </section>
  );
}

export default CareerRecommendations;
