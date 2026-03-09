import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getDashboardData } from "../services/api";
import { getLearningPath } from "../services/learningService";

function parseCsvToArray(value = "") {
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [career, setCareer] = useState("");
  const [skillGap, setSkillGap] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [adminNote, setAdminNote] = useState("");

  const profileName = localStorage.getItem("userName") || "Student User";
  const storedProfile = useMemo(() => JSON.parse(localStorage.getItem("studentProfile") || "{}"), []);

  useEffect(() => {
    let mounted = true;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError("");

        const technicalSkills = parseCsvToArray(storedProfile.skills);
        const fallbackTechnicalSkills = ["Python", "React", "SQL"];
        const payload = {
          name: storedProfile.name || profileName,
          degree: storedProfile.degree || "",
          gpa: storedProfile.gpa || "",
          technicalSkills: technicalSkills.length ? technicalSkills : fallbackTechnicalSkills,
          skills: technicalSkills.length ? technicalSkills : fallbackTechnicalSkills,
          softSkills: parseCsvToArray(storedProfile.softSkills),
          interests: parseCsvToArray(storedProfile.interests),
          careerGoal: storedProfile.careerGoal || ""
        };

        const [dashboardResponse, notesResponse] = await Promise.all([
          getDashboardData(payload),
          axios.get("http://localhost:5000/api/admin-notes")
        ]);

        if (!mounted) {
          return;
        }

        const dashboardData = dashboardResponse.data || {};
        setCareer(dashboardData.career || "");
        setSkillGap(dashboardData.skillGap || []);
        setAdminNote(Array.isArray(notesResponse.data) && notesResponse.data.length ? notesResponse.data[0].content : "");

        const learningResponse = await getLearningPath(dashboardData.skillGap || []);
        if (!mounted) {
          return;
        }
        setLearningPaths(learningResponse.data || []);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_28px_rgba(59,130,246,0.14)]">
        <h2 className="text-xl font-semibold text-white">Student Overview</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-[#9cb2d1]">Name</p>
            <p className="mt-1 font-medium text-white">{storedProfile.name || profileName}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-[#9cb2d1]">Degree</p>
            <p className="mt-1 font-medium text-white">{storedProfile.degree || "Not set"}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-[#9cb2d1]">GPA</p>
            <p className="mt-1 font-medium text-white">{storedProfile.gpa || "Not set"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_28px_rgba(59,130,246,0.14)]">
        <h2 className="text-xl font-semibold text-white">Career Recommendation</h2>
        {loading ? <p className="mt-2 text-sm text-ai-text/70">Loading...</p> : null}
        {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
        {!loading && !error ? <p className="mt-4 text-base text-white">{career || "Software Engineer"}</p> : null}
      </section>

      <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_28px_rgba(59,130,246,0.14)]">
        <h3 className="text-lg font-semibold text-white">Skill Gap Analysis</h3>
        <ul className="mt-3 space-y-2 text-sm text-[#c8d8ef]">
          {skillGap.length ? skillGap.map((skill) => <li key={skill}>- {skill}</li>) : <li>- No major skill gaps found.</li>}
        </ul>
      </section>

      <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_28px_rgba(59,130,246,0.14)]">
        <h3 className="text-lg font-semibold text-white">Admin Guidance</h3>
        <article className="mt-3 rounded-xl border border-white/10 bg-[#0b1f36] p-4">
          <h4 className="text-sm font-semibold text-blue-200">Admin Guidance Notes</h4>
          <p className="mt-2 whitespace-pre-line text-sm text-[#c8d8ef]">
            {adminNote ||
              "Students with strong frontend skills should focus on mastering JavaScript frameworks, system design, and building real-world projects."}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_28px_rgba(59,130,246,0.14)]">
        <h3 className="text-lg font-semibold text-white">Learning Paths</h3>
        <div className="mt-3 space-y-3 text-sm text-ai-text/80">
          {learningPaths.length ? (
            learningPaths.map((path) => (
              <article key={path.skill} className="rounded-xl border border-white/10 bg-[#0b1f36] p-3">
                <h4 className="font-semibold text-white">{path.skill}</h4>
                <ul className="mt-2 space-y-1 text-xs text-[#c8d8ef]">
                  {(path.resources || []).length ? (
                    path.resources.map((resource) => (
                      <li key={`${path.skill}-${resource.title}`}>
                        - {resource.title} - {resource.platform}
                      </li>
                    ))
                  ) : (
                    <li>- No curated resources found yet.</li>
                  )}
                </ul>
              </article>
            ))
          ) : (
            <p>- Personalized recommendations will appear after skill-gap analysis.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentDashboard;
