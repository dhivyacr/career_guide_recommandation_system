function CareerCard({ career, isBestMatch = false }) {
  return (
    <article
      className={`career-card rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${isBestMatch ? "best-glow" : ""}`}
    >
      {isBestMatch ? <div className="best-match-badge">Best Match ⭐</div> : null}
      <h3 className="text-xl font-semibold text-white">{career.careerName}</h3>
      <p className="mt-1 text-sm font-medium text-blue-300">{career.matchScore}% Match</p>
      <p className="mt-3 text-sm text-[#b7c9e4]">{career.description || "Focus on backend systems."}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(career.requiredSkills || []).map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-blue-400/30 bg-blue-500/10 px-2 py-1 text-xs text-[#d8e8ff]"
          >
            {skill}
          </span>
        ))}
      </div>
    </article>
  );
}

export default CareerCard;
