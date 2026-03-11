import { useEffect, useMemo, useState } from "react";
import CareerCard from "../components/CareerCard";
import { getCareerDetails } from "../services/recommendService";
import "../styles/career.css";

function Career() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [career, setCareer] = useState("");
  const [skillGap, setSkillGap] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const profile = useMemo(() => JSON.parse(localStorage.getItem("studentProfile") || "{}"), []);
  const registerNumber = profile.registerNumber || profile.regNo || "";

  useEffect(() => {
    let mounted = true;

    async function loadCareerData() {
      if (!registerNumber) {
        setError("Complete your profile with a valid register number to view career recommendations.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getCareerDetails(registerNumber);

        if (!mounted) {
          return;
        }

        setCareer(response.data?.careerRecommendation || "");
        setSkillGap(response.data?.skillGap || []);
        setRecommendations(response.data?.recommendations || []);
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
  }, [registerNumber]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_28px_rgba(59,130,246,0.14)]">
        <h2 className="text-2xl font-semibold text-white">Career Recommendation</h2>
        {loading ? <p className="mt-3 text-sm text-[#b4c3d9]">Loading career insights...</p> : null}
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        {!loading && !error ? <p className="mt-4 text-lg font-medium text-white">{career || "Software Developer"}</p> : null}
      </section>

      {!loading && !error && recommendations.length ? (
        <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_28px_rgba(59,130,246,0.14)]">
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((item, index) => (
              <CareerCard key={`${item.careerName}-${index}`} career={item} isBestMatch={index === 0} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_28px_rgba(59,130,246,0.14)]">
        <h2 className="text-2xl font-semibold text-white">Skill Gap</h2>
        {!loading && !error ? (
          <ul className="mt-4 space-y-2 text-sm text-[#d7e6ff]">
            {skillGap.length ? (
              skillGap.map((skill) => <li key={skill}>- {skill}</li>)
            ) : (
              <li>- No major skill gaps detected.</li>
            )}
          </ul>
        ) : null}
      </section>
    </div>
  );
}

export default Career;
