import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiAward, FiBookOpen, FiTarget, FiTrendingUp, FiUser } from "react-icons/fi";
import StudentProgressChart from "../components/admin/StudentProgressChart";
import StudentSkillRadar from "../components/admin/StudentSkillRadar";
import { addMentorGuidance, getStudentByRegisterNumber } from "../services/adminService";

const SPECIAL_CASE_WORDS = {
  ai: "AI",
  api: "API",
  aws: "AWS",
  css: "CSS",
  figma: "Figma",
  git: "Git",
  html: "HTML",
  javascript: "JavaScript",
  ml: "ML",
  mongodb: "MongoDB",
  "node.js": "Node.js",
  react: "React",
  sql: "SQL",
  ui: "UI",
  ux: "UX"
};

function formatCamelCase(text) {
  if (!text) {
    return "";
  }

  return String(text)
    .toLowerCase()
    .split(" ")
    .map((word) => {
      const trimmedWord = word.trim();
      if (!trimmedWord) {
        return "";
      }
      if (SPECIAL_CASE_WORDS[trimmedWord]) {
        return SPECIAL_CASE_WORDS[trimmedWord];
      }
      return trimmedWord.charAt(0).toUpperCase() + trimmedWord.slice(1);
    })
    .join(" ");
}

function normalizeSkillList(values) {
  if (Array.isArray(values)) {
    return values.map((value) => formatCamelCase(String(value || "").trim())).filter(Boolean);
  }

  return String(values || "")
    .split(",")
    .map((value) => formatCamelCase(value.trim()))
    .filter(Boolean);
}

function renderProgressColor(score) {
  if (score >= 85) {
    return "from-emerald-400 to-cyan-400";
  }

  if (score >= 70) {
    return "from-cyan-400 to-blue-500";
  }

  if (score >= 50) {
    return "from-amber-400 to-orange-400";
  }

  return "from-rose-400 to-orange-500";
}

function buildSkillStrengths(student) {
  const skills = normalizeSkillList(student?.skills || student?.technicalSkills || []);
  const recommendations = Array.isArray(student?.recommendations) ? student.recommendations : [];

  return skills.map((skill, index) => {
    const bestRelatedRecommendation = recommendations.find((item) =>
      (item.requiredSkills || []).some((requiredSkill) => formatCamelCase(requiredSkill) === skill)
    );
    const recommendationScore = Number(bestRelatedRecommendation?.matchPercentage || 0);
    const score = Math.min(95, Math.max(55, 68 + recommendationScore * 0.25 + (skills.length - index - 1) * 4));

    return {
      skill,
      score: Math.round(score)
    };
  });
}

function buildProgressDatasets(skillStrengths = []) {
  const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
  const datasets = skillStrengths.slice(0, 3).map((item, index) => {
    const finalScore = item.score;
    const growthBase = Math.max(18, 36 - index * 4);

    return {
      label: item.skill,
      data: [
        Math.max(10, finalScore - growthBase),
        Math.max(20, finalScore - Math.round(growthBase * 0.58)),
        Math.max(30, finalScore - Math.round(growthBase * 0.26)),
        finalScore
      ]
    };
  });

  return { labels, datasets };
}

function OverviewField({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function AdminStudentProfile() {
  const { registerNumber } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guidance, setGuidance] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchStudent() {
      try {
        setLoading(true);
        setError("");
        const response = await getStudentByRegisterNumber(registerNumber);

        if (!mounted) {
          return;
        }

        const studentData = response.data?.student || null;
        setStudent(studentData);
        setGuidance(studentData?.adminGuidance || "");
      } catch (fetchError) {
        if (!mounted) {
          return;
        }

        setError(fetchError.response?.data?.message || "Failed to fetch student profile.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchStudent();

    return () => {
      mounted = false;
    };
  }, [registerNumber]);

  async function handleSaveGuidance() {
    if (!student?._id || !guidance.trim()) {
      return;
    }

    try {
      setSaving(true);
      const response = await addMentorGuidance(student._id, guidance);
      const updatedStudent = response.data?.student;

      setStudent((current) => ({
        ...current,
        adminGuidance: updatedStudent?.adminGuidance || guidance,
        mentorGuidance: updatedStudent?.mentorGuidance || current?.mentorGuidance || [],
        ...(updatedStudent || {})
      }));
      setGuidance("");
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Failed to save guidance.");
    } finally {
      setSaving(false);
    }
  }

  function generateReport() {
    if (!student) {
      return;
    }

    const doc = new jsPDF();
    const bestMatch = recommendations[0];
    const topCareerText = bestMatch
      ? `${formatCamelCase(bestMatch.careerName)} (${Math.round(Number(bestMatch.matchPercentage || bestMatch.matchScore || 0))}%)`
      : student.recommendation || student.careerPath || "No recommendation available";

    doc.setFontSize(18);
    doc.text("Career Guidance Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Student: ${formatCamelCase(student.name) || "N/A"}`, 20, 40);
    doc.text(`Register Number: ${student.registerNumber || "N/A"}`, 20, 50);
    doc.text(`Department: ${formatCamelCase(student.department) || "N/A"}`, 20, 60);
    doc.text(`CGPA: ${Number(student.cgpa || 0).toFixed(2)}`, 20, 70);
    doc.text(`Mentor: ${formatCamelCase(student.mentorName) || "Unassigned"}`, 20, 80);

    doc.text("Top Career Recommendation:", 20, 100);
    doc.text(topCareerText, 20, 110);

    doc.text("Skill Gap:", 20, 130);
    if (skillGap.length) {
      skillGap.slice(0, 6).forEach((skill, index) => {
        doc.text(`- ${skill}`, 24, 140 + index * 8);
      });
    } else {
      doc.text("No critical skill gaps identified.", 24, 140);
    }

    doc.text("Mentor Guidance:", 20, 190);
    const guidanceText = doc.splitTextToSize(
      student.adminGuidance ||
        student.mentorGuidance?.[student.mentorGuidance.length - 1]?.message ||
        "No mentor guidance yet.",
      170
    );
    doc.text(guidanceText, 20, 200);

    doc.save(`${student.registerNumber || "career"}-guidance-report.pdf`);
  }

  const skillStrengths = useMemo(() => buildSkillStrengths(student), [student]);
  const recommendations = useMemo(() => {
    const items = Array.isArray(student?.recommendations) ? student.recommendations : [];
    return items.slice(0, 5);
  }, [student]);
  const skillGap = useMemo(() => normalizeSkillList(student?.skillGap || []), [student]);
  const progressChartData = useMemo(() => buildProgressDatasets(skillStrengths), [skillStrengths]);
  const radarLabels = useMemo(() => skillStrengths.slice(0, 5).map((item) => item.skill), [skillStrengths]);
  const radarValues = useMemo(() => skillStrengths.slice(0, 5).map((item) => item.score), [skillStrengths]);

  return (
    <div className="space-y-6 text-[#e5e7eb]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Student Progress</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Detailed analytics for student growth and readiness.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Review academic performance, career alignment, skill readiness, and mentor guidance from one view.
          </p>
        </div>

        <Link
          to="/admin/students"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>
      </div>

      {!loading && !error && student ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={generateReport}
            className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.28)] transition hover:brightness-110"
          >
            Generate Career Report
          </button>
        </div>
      ) : null}

      {loading ? <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">Loading student profile...</p> : null}
      {error ? <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

      {!loading && !error && student ? (
        <section className="space-y-6">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200">
                <FiUser className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Student Overview</h3>
                <p className="text-sm text-slate-400">Snapshot of core academic and mentoring details.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <OverviewField label="Name" value={formatCamelCase(student.name) || "N/A"} />
              <OverviewField label="Register Number" value={student.registerNumber || "N/A"} />
              <OverviewField label="Department" value={formatCamelCase(student.department) || "N/A"} />
              <OverviewField label="CGPA" value={Number(student.cgpa || 0).toFixed(2)} />
              <OverviewField label="Mentor Name" value={formatCamelCase(student.mentorName) || "Unassigned"} />
            </div>
          </article>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-emerald-200">
                  <FiTrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Skill Strength Analysis</h3>
                  <p className="text-sm text-slate-400">Estimated strength based on current profile skills and career fit.</p>
                </div>
              </div>

                <div className="mt-6 space-y-4">
                  {skillStrengths.length ? (
                    skillStrengths.map((item) => (
                      <div key={item.skill} className="rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-white">{item.skill}</p>
                          <span className="text-sm font-semibold text-slate-200">{item.score}%</span>
                        </div>
                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${renderProgressColor(item.score)} transition-[width] duration-500`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No skills available yet.</p>
                  )}
                </div>
              </article>

              <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200">
                    <FiTarget className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Student Skill Radar</h3>
                    <p className="text-sm text-slate-400">Visual comparison of the student’s strongest skills.</p>
                  </div>
                </div>

                <div className="mt-6 h-[320px]">
                  {radarLabels.length ? (
                    <StudentSkillRadar labels={radarLabels} skills={radarValues} />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-400">
                      Not enough skill data available to render the radar chart.
                    </div>
                  )}
                </div>
              </article>

              <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200">
                    <FiTrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Student Progress Chart</h3>
                    <p className="text-sm text-slate-400">Trend view of current skill improvement across recent weeks.</p>
                  </div>
                </div>

                <div className="mt-6 h-[320px]">
                  {progressChartData.datasets.length ? (
                    <StudentProgressChart progress={progressChartData} />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-400">
                      Not enough skill data available to render progress trends.
                    </div>
                  )}
                </div>
              </article>
            </div>

            <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200">
                  <FiTarget className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Career Match</h3>
                  <p className="text-sm text-slate-400">Best-fit roles generated from the student skill profile.</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {recommendations.length ? (
                  recommendations.map((item, index) => (
                    <div key={`${item.careerName}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">{formatCamelCase(item.careerName) || "Career Match"}</p>
                          {item.isBestMatch ? (
                            <span className="mt-2 inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                              Best Match
                            </span>
                          ) : null}
                        </div>
                        <span className="text-base font-semibold text-cyan-200">
                          {Math.round(Number(item.matchPercentage || item.matchScore || 0))}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No career matches available.</p>
                )}
              </div>
            </article>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-amber-200">
                  <FiAward className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Skill Gap</h3>
                  <p className="text-sm text-slate-400">Missing skills required for the strongest recommended path.</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {skillGap.length ? (
                  skillGap.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No critical skill gaps identified.</p>
                )}
              </div>
            </article>

            <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-blue-200">
                  <FiBookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Mentor Feedback</h3>
                  <p className="text-sm text-slate-400">Review and update guidance for the student’s next steps.</p>
                </div>
              </div>

              <textarea
                value={guidance}
                onChange={(event) => setGuidance(event.target.value)}
                placeholder="Write mentor guidance for this student..."
                className="mt-6 min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
              />

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveGuidance}
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Guidance"}
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Saved Guidance</h4>
                {student.mentorGuidance?.length ? (
                  <ul className="mt-4 space-y-3">
                    {student.mentorGuidance
                      .slice()
                      .reverse()
                      .map((entry, index) => (
                        <li key={`${entry.date || "guidance"}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                          <p className="whitespace-pre-line text-sm text-slate-200">{entry.message}</p>
                          <p className="mt-2 text-xs text-slate-500">
                            {entry.date ? new Date(entry.date).toLocaleString("en-IN") : ""}
                          </p>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-slate-400">{student.adminGuidance || "No mentor guidance yet."}</p>
                )}
              </div>
            </article>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default AdminStudentProfile;
