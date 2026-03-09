import { Link } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Footer from "../../../components/layout/Footer";

const features = [
  {
    icon: "CR",
    title: "Career Recommendation",
    description: "Get personalized career matches aligned with your skills and interests."
  },
  {
    icon: "SG",
    title: "Skill Gap Analysis",
    description: "Identify missing skills and receive targeted upskilling suggestions instantly."
  },
  {
    icon: "CI",
    title: "Career Insights",
    description: "Explore demand trends and role requirements to make confident decisions."
  }
];

function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-80 h-80 w-80 rounded-full bg-blue-700/20 blur-3xl" />
      <Navbar />

      <main className="section-shell relative py-12 sm:py-16">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Navigate Your Future with Precision
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ai-text/80">
              Discover AI-powered career recommendations tailored to your skills, interests, and long-term professional goals.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="button-gradient">
                Get Started
              </Link>
              <a href="#features" className="rounded-xl border border-blue-300/30 px-5 py-2.5 font-semibold hover:bg-blue-500/10">
                Learn More
              </a>
            </div>
          </div>

          <div className="card-container hover-lift p-8">
            <div className="h-72 rounded-xl border border-blue-300/20 bg-gradient-to-br from-blue-500/20 to-transparent p-6">
              <p className="text-sm text-ai-text/70">AI Illustration Placeholder</p>
              <div className="mt-6 space-y-3">
                <div className="h-3 w-3/4 rounded-full bg-blue-400/35" />
                <div className="h-3 w-2/3 rounded-full bg-blue-400/30" />
                <div className="h-3 w-1/2 rounded-full bg-blue-400/25" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-24">
          <h2 className="text-3xl font-bold text-white">Core Features</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="card-container hover-lift rounded-3xl border-blue-300/20 bg-ai-card p-6 transition duration-300 hover:border-blue-400/60 hover:bg-[#1a3558]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold tracking-wide text-blue-200">
                  {feature.icon}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-ai-text/75">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mt-20 card-container p-8">
          <h2 className="text-2xl font-bold text-white">How it Works</h2>
          <p className="mt-3 text-ai-text/80">
            We analyze your profile, compare it with role requirements, and generate actionable career and learning guidance.
          </p>
        </section>

        <section id="pricing" className="mt-8 card-container p-8">
          <h2 className="text-2xl font-bold text-white">Pricing</h2>
          <p className="mt-3 text-ai-text/80">Start free and upgrade as your career planning needs grow.</p>
        </section>

        <section className="mt-24">
          <div className="cta-grid relative overflow-hidden rounded-[28px] border border-blue-300/20 bg-button-gradient p-10 shadow-glow">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-blue-900/20" />
            <h3 className="relative max-w-2xl text-3xl font-bold text-white">Ready to unlock your professional potential?</h3>
            <Link to="/register" className="relative mt-6 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50">
              Create Free Account
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
