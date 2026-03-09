function SkillGapCard({ gap }) {
  const missing = gap.missingSkills || [];

  return (
    <section className="glow-card p-4">
      <h3 className="text-lg font-semibold text-white">Skill Gap Analysis</h3>
      <p className="mt-1 text-sm text-ai-text/75">Target Career: {gap.careerName || "N/A"}</p>

      <div className="mt-4 space-y-3">
        {missing.length ? (
          missing.map((skill, index) => {
            const progress = Math.max(15, 85 - index * 12);
            return (
              <div key={skill}>
                <div className="mb-1 flex items-center justify-between text-xs text-ai-text/75">
                  <span>{skill}</span>
                  <span>{100 - progress}% missing</span>
                </div>
                <div className="h-2 rounded-full bg-[#0f2a47]">
                  <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })
        ) : (
          <span className="text-sm text-ai-text/70">No missing skills detected.</span>
        )}
      </div>
    </section>
  );
}

export default SkillGapCard;
