import { useNavigate } from "react-router-dom";
import heroImage from "../assets/career-illustration.png";

const features = [
  {
    icon: "CR",
    title: "Career Recommendation",
    description:
      "Receive personalized career path suggestions based on your skills, interests, academic profile, and evolving industry demand."
  },
  {
    icon: "SG",
    title: "Skill Gap Analysis",
    description:
      "Identify the specific technical and soft skills you need to develop in order to reach your desired professional roles with clarity."
  },
  {
    icon: "CI",
    title: "Career Insights",
    description:
      "Access real-time market insights including salary trends, industry growth forecasts, and emerging career opportunities."
  }
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <section className="glow-card overflow-hidden p-8 sm:p-10">
        <div className="hero-container">
          <div className="hero-text">
            <p className="inline-block rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-200">
              AI-POWERED CAREER EVOLUTION
            </p>
            <h1 className="max-w-2xl text-[48px] font-bold leading-[1.2] text-white">
              Navigate Your Future with Precision
            </h1>
            <p className="mt-4 max-w-2xl text-[18px] leading-[1.6] text-white/75">
              Discover the perfect career path tailored to your unique skills and aspirations using our Intelligent Career Guidance Recommendation System.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-lg bg-ai-accent px-5 py-2.5 text-[16px] font-semibold text-white hover:shadow-glow"
              >
                Get Started
              </button>
              <button
                type="button"
                onClick={() => navigate("/about")}
                className="rounded-lg border border-blue-400/30 px-5 py-2.5 text-[16px] font-semibold hover:bg-blue-500/10"
              >
                Learn More
              </button>
            </div>
            <p className="mt-5 text-sm text-ai-text/70">
              AI-powered recommendations designed to guide students toward the right career path.
            </p>
          </div>

          <div className="hero-image">
            <img src={heroImage} alt="Career Guidance Illustration" />
            <svg className="career-path-overlay" viewBox="0 0 800 600" preserveAspectRatio="none">
              <path
                d="M400 580 C350 500 450 420 380 350 C330 300 450 250 420 200"
                className="career-path-line"
              />
            </svg>
          </div>
        </div>
      </section>

      <section id="features" className="glow-card p-5">
        <p className="text-[12px] font-semibold tracking-[1px] text-blue-300">OUR CORE CAPABILITIES</p>
        <h2 className="mt-2 text-[34px] font-bold text-white">Empowering Your Career Journey</h2>
        <p className="mt-2 text-sm text-ai-text/75">
          Leverage advanced algorithms to bridge the gap between where you are today and where you want to be in your professional career.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="glow-card feature-card p-5">
            <div className="feature-icon inline-flex items-center justify-center text-xs font-semibold text-blue-200">
              {feature.icon}
            </div>
            <h2 className="text-[18px] font-semibold text-white">{feature.title}</h2>
            <p className="mt-2 text-[14px] leading-[1.5] text-white/70">{feature.description}</p>
          </article>
        ))}
      </section>

      <section
        id="pricing"
        className="relative overflow-hidden rounded-[24px] p-8 text-center sm:p-[60px]"
        style={{ background: "linear-gradient(135deg, #4F8EF7, #3B82F6)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)",
            backgroundSize: "48px 48px"
          }}
        />
        <h2 className="relative text-2xl font-semibold text-white sm:text-4xl">Ready to unlock your professional potential?</h2>
        <p className="relative mt-3 text-sm text-blue-50 sm:text-base">
          Join thousands of students and professionals who have discovered their ideal career path using our AI-driven recommendation engine.
        </p>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="relative mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 transition hover:scale-105"
        >
          Start Your Career Journey
        </button>
      </section>
    </div>
  );
}

export default LandingPage;
