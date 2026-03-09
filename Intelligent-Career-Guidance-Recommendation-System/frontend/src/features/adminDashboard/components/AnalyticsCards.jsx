function formatValue(value) {
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  return value;
}

function AnalyticsCards({ totalUsers, completedProfiles, mostRecommendedCareer, loading }) {
  const analytics = [
    { title: "Total Users", value: formatValue(totalUsers), indicator: "+12.5% growth" },
    { title: "Profiles Completed", value: formatValue(completedProfiles), indicator: "+5.2%" },
    { title: "Most Recommended Career", value: mostRecommendedCareer || "N/A", indicator: "+8.1%" }
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {analytics.map((item) => (
        <article key={item.title} className="card-container hover-lift rounded-3xl bg-ai-card p-5">
          <p className="text-sm text-ai-text/70">{item.title}</p>
          <p className="mt-2 text-2xl font-bold text-white">{loading ? "Loading..." : item.value}</p>
          <p className="mt-3 text-xs font-semibold text-blue-300">{item.indicator}</p>
        </article>
      ))}
    </section>
  );
}

export default AnalyticsCards;
