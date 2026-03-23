import { useEffect, useMemo, useState } from "react";
import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import AdminGuidance from "../components/AdminGuidance";
import CareerRecommendations from "../components/CareerRecommendations";
import OverallReadiness from "../components/OverallReadiness";
import SkillGapPanel from "../components/SkillGapPanel";
import StudentOverview from "../components/StudentOverview";
import WeeklyGoal from "../components/WeeklyGoal";
import StudentSkillRadar from "../components/admin/StudentSkillRadar";
import { getDashboardData, getReadinessReport, updateWeeklyGoal } from "../services/api";
import { getStudentProfile } from "../services/studentService";

function normalizeProfile(profile = {}, fallbackName = "Student") {
  return {
    name: profile.name || fallbackName,
    registerNumber: profile.registerNumber || profile.regNo || "Not set",
    degree: profile.department || profile.degree || "Not set",
    gpa: profile.cgpa ? `${Number(profile.cgpa).toFixed(1)} / 10.0` : profile.gpa ? `${profile.gpa} / 10.0` : "Not set",
    mentorName: profile.mentorName || "Mentor not assigned yet"
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
  const [analytics, setAnalytics] = useState({
    skillMetrics: [],
    readiness: 0,
    readinessReport: {
      readinessScore: 0,
      skillMatch: 0,
      goalCompletion: 0,
      profileCompletion: 0,
      topCareerMatch: "",
      bestCareerMatchLabel: "",
      strengths: [],
      skillGap: [],
      weeklyGoals: [],
      nextRecommendation: ""
    },
    weeklyGoal: {
      goals: [],
      completed: 0,
      total: 0,
      progress: 0,
      targetText: "Complete your next learning modules to improve readiness.",
      message: ""
    }
  });
  const [adminGuidance, setAdminGuidance] = useState("");
  const [mentorGuidance, setMentorGuidance] = useState([]);
  const [updatingGoalIds, setUpdatingGoalIds] = useState([]);
  const [report, setReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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
        setAnalytics(
          data.analytics || {
            skillMetrics: [],
            readiness: 0,
            readinessReport: {
              readinessScore: 0,
              skillMatch: 0,
              goalCompletion: 0,
              profileCompletion: 0,
              topCareerMatch: "",
              bestCareerMatchLabel: "",
              strengths: [],
              skillGap: [],
              weeklyGoals: [],
              nextRecommendation: ""
            },
            weeklyGoal: {
              goals: [],
              completed: 0,
              total: 0,
              progress: 0,
              targetText: "Complete your next learning modules to improve readiness.",
              message: ""
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

  async function handleToggleWeeklyGoal(goalId, completed) {
    setUpdatingGoalIds((current) => [...current, goalId]);

    setAnalytics((current) => ({
      ...current,
      weeklyGoal: {
        ...current.weeklyGoal,
        goals: (current.weeklyGoal?.goals || []).map((goal) =>
          goal._id === goalId ? { ...goal, completed } : goal
        ),
        completed: (current.weeklyGoal?.goals || []).filter((goal) =>
          goal._id === goalId ? completed : goal.completed
        ).length,
        progress: current.weeklyGoal?.total
          ? Math.round(
              ((current.weeklyGoal?.goals || []).filter((goal) =>
                goal._id === goalId ? completed : goal.completed
              ).length /
                current.weeklyGoal.total) *
                100
            )
          : 0,
        message:
          current.weeklyGoal?.total &&
          (current.weeklyGoal?.goals || []).filter((goal) =>
            goal._id === goalId ? completed : goal.completed
          ).length === current.weeklyGoal.total
            ? "Great work! Weekly goal completed 🎉"
            : ""
      }
    }));

    try {
      const response = await updateWeeklyGoal(goalId, completed);
      const weeklyGoal = response.data?.weeklyGoal;
      const readinessReport = response.data?.readinessReport;

      if (weeklyGoal || readinessReport) {
        setAnalytics((current) => ({
          ...current,
          weeklyGoal: weeklyGoal || current.weeklyGoal,
          readiness: readinessReport?.readinessScore ?? current.readiness,
          readinessReport: readinessReport || current.readinessReport
        }));
      }
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || "Failed to update weekly goal.");
      const response = await getDashboardData();
      const freshAnalytics = response.data?.analytics;
      if (freshAnalytics) {
        setAnalytics(freshAnalytics);
      }
    } finally {
      setUpdatingGoalIds((current) => current.filter((item) => item !== goalId));
    }
  }

  async function handleGenerateReport() {
    const userId = student?.userId || student?._id || storedProfile?.userId;

    if (!userId) {
      setError("Unable to generate readiness report.");
      return;
    }

    try {
      setIsGeneratingReport(true);
      const response = await getReadinessReport(userId);
      setReport(response.data || null);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || "Failed to generate detailed report.");
    } finally {
      setIsGeneratingReport(false);
    }
  }

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

  const studentRadarLabels = useMemo(
    () => (analytics.skillMetrics || []).slice(0, 5).map((item) => item.skill),
    [analytics.skillMetrics]
  );
  const studentRadarValues = useMemo(
    () => (analytics.skillMetrics || []).slice(0, 5).map((item) => Number(item.score ?? item.percentage ?? 0)),
    [analytics.skillMetrics]
  );

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
          </div>

          <aside className="col-span-12 space-y-6 xl:col-span-4">
            <SkillGapPanel items={analytics.skillMetrics || []} />
            <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <h3 className="text-xl font-semibold text-white">Student Skill Radar</h3>
              <p className="mt-1 text-sm text-slate-400">Visual breakdown of your strongest skills.</p>
              <div className="mt-6 h-[320px]">
                {studentRadarLabels.length ? (
                  <StudentSkillRadar labels={studentRadarLabels} skills={studentRadarValues} />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-400">
                    No skill metrics available yet.
                  </div>
                )}
              </div>
            </section>
            <WeeklyGoal
              weeklyGoal={analytics.weeklyGoal}
              onToggleGoal={handleToggleWeeklyGoal}
              updatingGoalIds={updatingGoalIds}
            />
            <OverallReadiness
              readinessScore={analytics.readiness || 0}
              breakdown={analytics.readinessReport || {}}
              onGenerateReport={handleGenerateReport}
              isGeneratingReport={isGeneratingReport}
            />
          </aside>
        </div>

        {report ? (
          <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">Career Readiness Report</h3>
                <p className="mt-1 text-sm text-slate-400">Focused summary of your best-fit role, strengths, gaps, and next step.</p>
              </div>
              <button
                type="button"
                onClick={() => setReport(null)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#0a1628]/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Best Career Match</p>
                <p className="mt-3 text-lg font-medium text-white">{report.bestCareerMatchLabel || "N/A"}</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#0a1628]/80 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Strengths</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(report.strengths || []).length ? (
                      report.strengths.map((skill) => (
                        <span key={skill} className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-100">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-300">No strong skills identified yet.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0a1628]/80 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Skill Gaps</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(report.skillGap || []).length ? (
                      report.skillGap.map((skill) => (
                        <span key={skill} className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-100">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-300">No critical skill gaps.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0a1628]/80 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Weekly Goals</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {(report.weeklyGoals || []).length ? (
                      report.weeklyGoals.map((goal) => (
                        <li key={goal._id || `${goal.skill}-${goal.goalTitle}`}>{goal.goalTitle}</li>
                      ))
                    ) : (
                      <li>No active weekly goals.</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0a1628]/80 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Overall Readiness</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{report.readinessScore || 0}%</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0a1628]/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Next Recommendation</p>
                <p className="mt-3 text-base font-medium text-white">
                  {report.nextRecommendation || "Build 2 practical projects aligned with your target career"}
                </p>
              </div>
            </div>
          </section>
        ) : null}

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
