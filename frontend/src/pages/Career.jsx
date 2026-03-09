import { useEffect, useMemo, useState } from "react";
import CareerCard from "../components/CareerCard";
import SkillBar from "../components/SkillBar";
import { getCareerRecommendations } from "../services/recommendService";
import { getSkillGap } from "../services/skillGapService";
import "../styles/career.css";

function parseCsvToArray(value = "") {
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function Career() {
  const [activeTab, setActiveTab] = useState("recommendation");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [skillGap, setSkillGap] = useState([]);

  const profile = useMemo(() => JSON.parse(localStorage.getItem("studentProfile") || "{}"), []);

  useEffect(() => {
    let mounted = true;

    async function loadCareerData() {
      try {
        setLoading(true);
        setError("");

        const payload = {
          name: profile.name || localStorage.getItem("userName") || "",
          degree: profile.degree || "",
          gpa: profile.gpa || "",
          technicalSkills: parseCsvToArray(profile.skills),
          softSkills: parseCsvToArray(profile.softSkills),
          interests: parseCsvToArray(profile.interests),
          careerGoal: profile.careerGoal || ""
        };

        const [recommendResponse, skillGapResponse] = await Promise.all([
          getCareerRecommendations(payload),
          getSkillGap(payload)
        ]);

        if (!mounted) {
          return;
        }

        const mappedRecommendations = (recommendResponse.data || [])
          .map((rec) => ({
            careerName: rec.title,
            matchScore: rec.matchScore ?? rec.score ?? 0,
            score: rec.score ?? rec.matchScore ?? 0,
            requiredSkills: rec.requiredSkills || [],
            salaryRange: "N/A",
            demandLevel: "N/A"
          }))
          .sort((a, b) => Number(b.score || b.matchScore || 0) - Number(a.score || a.matchScore || 0));

        setRecommendations(mappedRecommendations);
        setSkillGap(skillGapResponse.data || []);
      } catch (apiError) {
        if (!mounted) {
          return;
        }
        setError(apiError.response?.data?.message || "Failed to load career data.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCareerData();
    return () => {
      mounted = false;
    };
  }, [profile]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("recommendation")}
          className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
            activeTab === "recommendation"
              ? "bg-[#3b82f6] text-white"
              : "border border-white/10 bg-transparent text-[#c7d6eb] opacity-70"
          }`}
        >
          Career Recommendation
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("skill-match")}
          className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
            activeTab === "skill-match"
              ? "bg-[#3b82f6] text-white"
              : "border border-white/10 bg-transparent text-[#c7d6eb] opacity-70"
          }`}
        >
          Skill Match
        </button>
      </div>

      <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_28px_rgba(59,130,246,0.14)]">
        {loading ? <p className="text-sm text-ai-text/70">Loading...</p> : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        {!loading && !error && activeTab === "recommendation" ? (
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((career, index) => (
              <CareerCard key={career.careerName} career={career} isBestMatch={index === 0} />
            ))}
          </div>
        ) : null}

        {!loading && !error && activeTab === "skill-match" ? (
          <div className="space-y-4">
            {skillGap.length ? (
              skillGap.map((item) => (
                <div key={item.career} className="rounded-xl border border-white/10 bg-[#0b1f36] p-4">
                  <SkillBar skill={item.career} percentage={item.readiness} />
                  <p className="mt-3 text-xs text-[#8fb1da]">Missing Skills:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(item.missingSkills || []).length ? (
                      item.missingSkills.map((skill) => (
                        <span key={`${item.career}-${skill}`} className="rounded-full bg-red-400/10 px-2 py-1 text-xs text-red-200">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-300">No missing skills</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#b4c3d9]">Add profile skills to see readiness progress.</p>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default Career;
