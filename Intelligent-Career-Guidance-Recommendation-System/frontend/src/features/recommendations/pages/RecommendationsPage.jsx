const recommendations = ["Software Engineer", "Data Scientist", "AI Engineer", "Business Analyst", "Cybersecurity Analyst"];

function RecommendationsPage() {
  return (
    <div className="section-shell py-10">
      <h1 className="text-3xl font-bold text-white">Career Recommendation</h1>
      <p className="mt-2 text-ai-text/75">Top roles matched by your skills and interests.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {recommendations.map((career) => (
          <article key={career} className="card-container hover-lift p-6">
            <h3 className="text-xl font-semibold text-white">{career}</h3>
            <p className="mt-2 text-sm text-ai-text/75">Strong fit based on your profile and market trends.</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default RecommendationsPage;
