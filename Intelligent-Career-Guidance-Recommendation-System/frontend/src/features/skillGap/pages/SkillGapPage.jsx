const skillGaps = [
  { skill: "Machine Learning", course: "ML Specialization" },
  { skill: "System Design", course: "Scalable Systems Fundamentals" },
  { skill: "Data Structures", course: "Advanced DS and Algorithms" }
];

function SkillGapPage() {
  return (
    <div className="section-shell py-10">
      <h1 className="text-3xl font-bold text-white">Skill Gap Analysis</h1>
      <p className="mt-2 text-ai-text/75">Identify missing capabilities and recommended learning paths.</p>

      <div className="mt-8 space-y-4">
        {skillGaps.map((item) => (
          <article key={item.skill} className="card-container hover-lift flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-semibold text-white">{item.skill}</h3>
              <p className="mt-1 text-sm text-ai-text/75">Recommended: {item.course}</p>
            </div>
            <button type="button" className="button-gradient">Start Learning</button>
          </article>
        ))}
      </div>
    </div>
  );
}

export default SkillGapPage;
