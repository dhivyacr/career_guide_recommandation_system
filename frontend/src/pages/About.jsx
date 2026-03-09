import { useNavigate } from "react-router-dom";

const whoCanUse = [
  {
    title: "Students",
    points: [
      "Discover suitable careers",
      "Identify skill gaps",
      "Build learning roadmap"
    ]
  },
  {
    title: "Universities",
    points: [
      "Help students choose the right career",
      "Improve placement success"
    ]
  },
  {
    title: "Career Advisors",
    points: ["Provide data-driven career counseling"]
  }
];

const howItWorks = [
  "Student logs in and enters profile details",
  "System analyzes skills, interests, and academic background",
  "Recommendation engine compares profile with career database",
  "System generates Career Recommendations, Skill Gap Analysis, and Learning Path Suggestions"
];

const whyUse = [
  "AI-Based Career Matching",
  "Personalized Skill Gap Analysis",
  "Industry Demand Insights",
  "Career Learning Roadmaps"
];

function About() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <section className="glow-card fade-up p-6 sm:p-8" style={{ animationDelay: "0.04s" }}>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">AI-Powered Career Guidance Platform</h1>
        <p className="mt-3 max-w-3xl text-ai-text/80">
          The platform analyzes student skills, interests, and industry demand to recommend suitable career paths using
          intelligent matching and recommendation algorithms.
        </p>
        <div className="mt-5 rounded-xl border border-blue-400/20 bg-[#0f2a47] p-4 text-sm text-ai-text/75">
          AI Illustration: intelligent engine analyzing profile data, mapping career paths, and ranking outcomes.
        </div>
      </section>

      <section className="fade-up grid gap-4 md:grid-cols-3" style={{ animationDelay: "0.1s" }}>
        {whoCanUse.map((group) => (
          <article key={group.title} className="glow-card p-5">
            <p className="inline-block rounded-md border border-blue-400/30 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-200">
              {group.title.slice(0, 2).toUpperCase()}
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">{group.title}</h2>
            <ul className="mt-3 space-y-1 text-sm text-ai-text/80">
              {group.points.map((point) => (
                <li key={point}>- {point}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="glow-card fade-up p-6" style={{ animationDelay: "0.16s" }}>
        <h2 className="text-2xl font-semibold text-white">How It Works</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {howItWorks.map((step, index) => (
            <div key={step} className="rounded-xl border border-blue-400/20 bg-[#0f2a47] p-4 transition hover:shadow-glow">
              <p className="text-xs font-semibold text-blue-300">Step {index + 1}</p>
              <p className="mt-2 text-sm text-ai-text/80">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="fade-up grid gap-4 md:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: "0.22s" }}>
        {whyUse.map((feature) => (
          <article key={feature} className="glow-card p-5">
            <h3 className="text-base font-semibold text-white">{feature}</h3>
            <p className="mt-2 text-sm text-ai-text/75">Built to improve decision quality and long-term career outcomes.</p>
          </article>
        ))}
      </section>

      <section className="glow-card fade-up p-6" style={{ animationDelay: "0.28s" }}>
        <h2 className="text-2xl font-semibold text-white">Technology Behind the Platform</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-blue-400/20 bg-[#0f2a47] p-4">
            <p className="text-sm font-semibold text-white">Frontend</p>
            <p className="mt-1 text-sm text-ai-text/75">React + Tailwind</p>
          </div>
          <div className="rounded-xl border border-blue-400/20 bg-[#0f2a47] p-4">
            <p className="text-sm font-semibold text-white">Backend</p>
            <p className="mt-1 text-sm text-ai-text/75">Node.js + Express</p>
          </div>
          <div className="rounded-xl border border-blue-400/20 bg-[#0f2a47] p-4">
            <p className="text-sm font-semibold text-white">Database</p>
            <p className="mt-1 text-sm text-ai-text/75">MongoDB</p>
          </div>
          <div className="rounded-xl border border-blue-400/20 bg-[#0f2a47] p-4">
            <p className="text-sm font-semibold text-white">AI Logic</p>
            <p className="mt-1 text-sm text-ai-text/75">Skill matching algorithm + recommendation scoring</p>
          </div>
        </div>
      </section>

      <section
        className="glow-card fade-up bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-center"
        style={{ animationDelay: "0.34s" }}
      >
        <h2 className="text-3xl font-bold text-white">Ready to Discover Your Ideal Career?</h2>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-5 rounded-lg bg-white px-6 py-2.5 font-semibold text-blue-700 transition hover:shadow-glow"
        >
          Get Started
        </button>
      </section>
    </div>
  );
}

export default About;
