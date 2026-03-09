import { useEffect, useMemo, useState } from "react";
import axiosClient from "../../../api/axiosClient";

const CAREER_DESCRIPTION_MAP = {
  "Software Engineer": "Strong fit for cloud-native development and distributed systems roles.",
  "Data Scientist": "Excellent trajectory for data modeling and production ML pipelines.",
  "AI Engineer": "Great alignment for building and deploying intelligent automation systems.",
  "Cybersecurity Analyst": "Well-suited for protecting systems and handling modern threat analysis.",
  "UI/UX Designer": "Ideal profile for crafting user-centered interfaces and product experiences.",
  "Business Analyst": "High potential for translating business needs into technical solutions."
};

function buildSkillMetrics(studentSkills = []) {
  const normalized = studentSkills.map((skill) => skill.toLowerCase());
  const categories = [
    { label: "Cloud Infrastructure", keywords: ["cloud", "aws", "azure", "gcp", "docker", "kubernetes"] },
    { label: "Machine Learning", keywords: ["machine learning", "ai", "tensorflow", "pytorch", "python", "statistics"] },
    { label: "Algorithm Design", keywords: ["algorithms", "data structures", "problem solving", "java", "c++"] },
    { label: "Team Leadership", keywords: ["communication", "leadership", "collaboration", "stakeholder management"] }
  ];

  return categories.map((category) => {
    const hits = category.keywords.filter((keyword) => normalized.some((skill) => skill.includes(keyword))).length;
    const value = Math.max(20, Math.min(95, Math.round((hits / category.keywords.length) * 100)));
    return { label: category.label, value };
  });
}

function toTitleCase(value = "") {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function StudentDashboardPage() {
  const menuItems = ["Dashboard", "Profile", "Careers", "Skill Gap", "Settings"];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [student, setStudent] = useState({
    name: "Student",
    education: "Education not set",
    gpa: "--",
    skills: [],
    interests: []
  });
  const [recommendations, setRecommendations] = useState([]);
  const [skillGap, setSkillGap] = useState({ missingSkills: [], suggestedLearningResources: [] });

  const learningPaths = useMemo(() => {
    if (!skillGap.suggestedLearningResources?.length) {
      return [];
    }

    return skillGap.suggestedLearningResources.slice(0, 3).map((entry, index) => ({
      title: `Master ${toTitleCase(entry.skill)}`,
      platform: entry.resources?.[0]?.title?.split(" - ")[1] || "CareerAI Learning",
      lessons: 12 + index * 7,
      duration: `${6 + index * 3}h total`,
      url: entry.resources?.[0]?.url || "#"
    }));
  }, [skillGap.suggestedLearningResources]);

  const skillProgress = useMemo(() => buildSkillMetrics(student.skills), [student.skills]);

  const readiness = useMemo(() => {
    if (!skillProgress.length) {
      return 50;
    }
    const total = skillProgress.reduce((sum, item) => sum + item.value, 0);
    return Math.round(total / skillProgress.length);
  }, [skillProgress]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");

        const profileResponse = await axiosClient.get("/profile");
        const user = profileResponse.data?.user || {};
        const studentSkills = user.skills || [];
        const studentInterests = user.interests || [];

        if (!isMounted) {
          return;
        }

        setStudent({
          name: user.name || "Student",
          education: user.education || "Education not set",
          gpa: "8.7",
          skills: studentSkills,
          interests: studentInterests
        });

        const recommendationResponse = await axiosClient.post("/recommend-career", {
          skills: studentSkills,
          interests: studentInterests
        });

        const recommendationData = recommendationResponse.data?.recommendations || [];
        if (!isMounted) {
          return;
        }

        const normalizedRecommendations = recommendationData.map((item) => ({
          career: item.careerName,
          match: Math.min(99, Math.max(45, item.score * 12)),
          description: CAREER_DESCRIPTION_MAP[item.careerName] || "Recommended based on your current profile.",
          skills: (item.matchedSkills?.length ? item.matchedSkills : item.missingSkills || []).slice(0, 4)
        }));

        setRecommendations(normalizedRecommendations);

        const topCareer = normalizedRecommendations[0]?.career;
        if (topCareer) {
          const skillGapResponse = await axiosClient.post("/skill-gap", {
            studentSkills,
            careerName: topCareer
          });

          if (!isMounted) {
            return;
          }

          setSkillGap({
            missingSkills: skillGapResponse.data?.missingSkills || [],
            suggestedLearningResources: skillGapResponse.data?.suggestedLearningResources || []
          });
        }
      } catch (apiError) {
        if (!isMounted) {
          return;
        }
        setError(apiError.response?.data?.message || "Unable to load dashboard data. Please log in and try again.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="section-shell py-6 sm:py-10">
      <div className="grid gap-6 xl:grid-cols-[260px,1fr,320px]">
        <aside className="card-container flex h-full flex-col rounded-3xl bg-ai-secondary/70 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-300/90">EduPath</p>
            <h2 className="mt-1 text-xl font-bold text-white">Student Portal</h2>
          </div>

          <nav className="mt-8 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item}
                type="button"
                className={`w-full rounded-xl px-4 py-2.5 text-left text-sm transition ${
                  item === "Dashboard"
                    ? "bg-ai-accent text-white shadow-glow"
                    : "text-ai-text/80 hover:bg-blue-500/15 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-blue-300/20 bg-ai-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/25 text-sm font-semibold text-blue-100">
                {student.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{student.name}</p>
                <p className="text-xs text-ai-text/70">{student.education}</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <header className="card-container flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
              <p className="mt-1 text-ai-text/75">Track your career progress and skill development</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="rounded-xl border border-blue-300/30 bg-[#102743] px-3 py-2 text-xs font-semibold text-ai-text hover:bg-blue-500/10">
                NOTIF
              </button>
              <button type="button" className="button-gradient">
                Upgrade Pro
              </button>
            </div>
          </header>

          {error ? (
            <section className="card-container rounded-2xl border-red-400/40 p-4 text-sm text-red-200">{error}</section>
          ) : null}

          <section className="card-container hover-lift rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/25 text-lg font-semibold text-blue-100">
                  {student.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{student.name}</h3>
                  <p className="text-sm text-ai-text/70">{student.education} | GPA: {student.gpa}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" className="rounded-xl border border-blue-300/30 px-4 py-2 text-sm hover:bg-blue-500/10">
                  Edit Profile
                </button>
                <button type="button" className="button-gradient px-4 py-2 text-sm">
                  View Portfolio
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Career Recommendations</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {loading ? (
                <div className="card-container rounded-3xl p-5 text-sm text-ai-text/70">Loading recommendations...</div>
              ) : null}
              {!loading && recommendations.length === 0 ? (
                <div className="card-container rounded-3xl p-5 text-sm text-ai-text/70">No recommendations available yet.</div>
              ) : null}
              {recommendations.map((item) => (
                <article key={item.career} className="card-container hover-lift rounded-3xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">{item.career}</h3>
                    <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">{item.match}% match</span>
                  </div>
                  <p className="mt-2 text-sm text-ai-text/75">{item.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.skills.map((skill) => (
                      <span key={skill} className="rounded-full border border-blue-300/30 bg-[#112944] px-3 py-1 text-xs text-blue-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Learning Paths</h2>
            <div className="mt-4 space-y-3">
              {!loading && learningPaths.length === 0 ? (
                <article className="card-container rounded-2xl p-5 text-sm text-ai-text/70">
                  Skill gap analysis will suggest learning paths after recommendations load.
                </article>
              ) : null}
              {learningPaths.map((path) => (
                <article key={path.title} className="card-container hover-lift flex items-center justify-between gap-4 rounded-2xl p-5">
                  <div>
                    <h3 className="text-base font-semibold text-white">{path.title}</h3>
                    <p className="mt-1 text-xs text-ai-text/70">{path.platform}</p>
                    <p className="mt-2 text-sm text-ai-text/80">
                      {path.lessons} Lessons | {path.duration}
                    </p>
                  </div>
                  <a
                    href={path.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-blue-300/30 bg-[#112944] px-3 py-2 text-xs font-semibold text-blue-100 hover:bg-blue-500/20"
                  >
                    PLAY
                  </a>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="space-y-6">
          <section className="card-container rounded-3xl p-5">
            <h2 className="text-lg font-semibold text-white">Skill Gap Analysis</h2>
            <div className="mt-2 text-xs text-ai-text/60">Missing skills: {skillGap.missingSkills.length || 0}</div>
            <div className="mt-4 space-y-4">
              {skillProgress.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-ai-text/75">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#0d223a]">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card-container rounded-3xl p-5">
            <h2 className="text-lg font-semibold text-white">Weekly Goal</h2>
            <p className="mt-2 text-sm text-ai-text/75">
              Complete {Math.max(1, Math.min(3, skillGap.missingSkills.length))} modules in your top missing skills to improve readiness.
            </p>
            <div className="mt-4 h-2 rounded-full bg-[#0d223a]">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                style={{ width: `${Math.max(30, 100 - skillGap.missingSkills.length * 10)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ai-text/60">Auto-updated from skill-gap data</p>
          </section>

          <section className="card-container rounded-3xl p-5">
            <h2 className="text-lg font-semibold text-white">Career Readiness Score</h2>
            <div className="mt-5 flex items-center justify-center">
              <div
                className="relative flex h-36 w-36 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#3B82F6 ${readiness}%, #16314f ${readiness}% 100%)`
                }}
              >
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-ai-bg text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">{readiness}%</p>
                    <p className="text-[11px] text-ai-text/70">Overall Career Readiness</p>
                  </div>
                </div>
              </div>
            </div>
            <button type="button" className="button-gradient mt-5 w-full">
              Generate Detailed Report
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default StudentDashboardPage;
