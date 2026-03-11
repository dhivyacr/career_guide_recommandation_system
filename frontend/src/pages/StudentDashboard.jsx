import { useEffect, useMemo, useState } from "react";
import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import AdminGuidance from "../components/AdminGuidance";
import CareerRecommendations from "../components/CareerRecommendations";
import LearningPaths from "../components/LearningPaths";
import OverallReadiness from "../components/OverallReadiness";
import SkillGapPanel from "../components/SkillGapPanel";
import StudentOverview from "../components/StudentOverview";
import WeeklyGoal from "../components/WeeklyGoal";
import { getDashboardData } from "../services/api";
import { getStudentProfile } from "../services/studentService";

function normalizeProfile(profile = {}, fallbackName = "Student") {
  return {
    name: profile.name || fallbackName,
    degree: profile.department || profile.degree || "Not set",
    gpa: profile.cgpa ? `${Number(profile.cgpa).toFixed(1)} / 10.0` : profile.gpa ? `${profile.gpa} / 10.0` : "Not set"
  };
}

function StudentDashboard() {
  const navigate = useNavigate();
  const storedProfile = useMemo(() => JSON.parse(localStorage.getItem("studentProfile") || "{}"), []);
  const profileName = localStorage.getItem("userName") || "Student";
  const registerNumber = storedProfile.registerNumber || storedProfile.regNo || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [student, setStudent] = useState(null);
  const [career, setCareer] = useState("");
  const [skillGap, setSkillGap] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [analytics, setAnalytics] = useState({
    skillMetrics: [],
    readiness: 0,
    weeklyGoal: {
      completed: 0,
      total: 3,
      targetText: "Complete your next learning modules to improve readiness."
    }
  });
  const [adminGuidance, setAdminGuidance] = useState("");
  const [mentorGuidance, setMentorGuidance] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const profileResponse = await getStudentProfile();
        const liveProfile = profileResponse.data?.student || null;

        if (!mounted) {
          return;
        }

        if (!liveProfile?.registerNumber && !liveProfile?.regNo) {
          localStorage.setItem("studentProfile", JSON.stringify(liveProfile || {}));
          navigate("/profile");
          return;
        }

        localStorage.setItem(
          "studentProfile",
          JSON.stringify({
            ...storedProfile,
            ...liveProfile,
            registerNumber: liveProfile.registerNumber || liveProfile.regNo || ""
          })
        );

        const response = await getDashboardData();

        if (!mounted) {
          return;
        }

        const data = response.data || {};
        if (data.message === "Profile incomplete") {
          navigate("/profile");
          return;
        }
        setStudent(data.student || null);
        setCareer(data.career || "");
        setSkillGap(data.skillGap || []);
        setRecommendations(data.recommendations || []);
        setLearningPaths(data.learningPaths || []);
        setAnalytics(
          data.analytics || {
            skillMetrics: [],
            readiness: 0,
            weeklyGoal: {
              completed: 0,
              total: 3,
              targetText: "Complete your next learning modules to improve readiness."
            }
          }
        );
        setAdminGuidance(data.adminGuidance || "");
        setMentorGuidance(data.mentorGuidance || []);
      } catch (fetchError) {
        if (!mounted) {
          return;
        }

        setError(fetchError.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [navigate, registerNumber, storedProfile]);

  const profile = normalizeProfile(student || storedProfile, profileName);
  const visibleRecommendations = recommendations.length
    ? recommendations
    : career
      ? [
          {
            careerName: career,
            matchScore: 100 - Math.min((skillGap || []).length * 15, 60),
            description: "Generated directly from your current profile, interests, and existing skill set.",
            requiredSkills: skillGap.length ? skillGap : ["No critical gaps"]
          }
        ]
      : [];

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[18%] top-12 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-20 right-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Student Dashboard</h1>
            <p className="mt-2 text-sm text-slate-400">Track your career progress and skill development</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:bg-white/10"
              aria-label="Notifications"
            >
              <FiBell />
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Upgrade Pro
            </button>
          </div>
        </header>

        {error ? (
          <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
        ) : null}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-6 xl:col-span-8">
            <StudentOverview profile={profile} />
            <CareerRecommendations recommendations={visibleRecommendations} />
            <AdminGuidance note={adminGuidance} entries={mentorGuidance} />
            <LearningPaths paths={learningPaths} />
          </div>

          <aside className="col-span-12 space-y-6 xl:col-span-4">
            <SkillGapPanel items={analytics.skillMetrics || []} />
            <WeeklyGoal
              completed={analytics.weeklyGoal?.completed || 0}
              total={analytics.weeklyGoal?.total || 3}
              targetText={analytics.weeklyGoal?.targetText}
            />
            <OverallReadiness value={analytics.readiness || 0} />
          </aside>
        </div>

        {!loading && skillGap.length ? (
          <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-xl font-semibold text-white">Dynamic Skill Gap Analysis</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {skillGap.map((skill) => (
                <li key={skill}>- {skill}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {loading ? <p className="text-sm text-slate-400">Refreshing dashboard insights...</p> : null}
      </div>
    </div>
  );
}

export default StudentDashboard;
