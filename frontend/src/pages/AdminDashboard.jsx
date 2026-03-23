import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiAward,
  FiBarChart2,
  FiCpu,
  FiBookOpen,
  FiMessageSquare,
  FiUsers
} from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import AnalyticsCard from "../components/AnalyticsCard";
import API from "../services/api";

const SPECIAL_CASE_WORDS = {
  ai: "AI",
  api: "API",
  apis: "APIs",
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

function formatSkills(skills = []) {
  if (Array.isArray(skills)) {
    return skills
      .map((skill) => formatCamelCase(String(skill || "").trim()))
      .filter(Boolean);
  }

  return String(skills || "")
    .split(",")
    .map((skill) => formatCamelCase(skill.trim()))
    .filter(Boolean);
}

function formatDepartmentLabel(department) {
  return formatCamelCase(department) || "Unassigned";
}

function departmentColor(index) {
  const palette = ["#38bdf8", "#818cf8", "#34d399", "#f59e0b", "#f472b6", "#22c55e"];
  return palette[index % palette.length];
}

function buildTopEntryLabel(entries, fallback = "N/A", formatter = (value) => value) {
  if (!entries.length) {
    return fallback;
  }

  return formatter(entries[0][0]);
}

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [savingId, setSavingId] = useState("");
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    averageCGPA: 0,
    departmentStats: {}
  });

  useEffect(() => {
    let mounted = true;

    async function fetchBaseData() {
      try {
        setLoading(true);
        setError("");
        const studentsResponse = await API.get("/students");
        const studentRows = Array.isArray(studentsResponse.data) ? studentsResponse.data : [];
        const departmentStats = studentRows.reduce((accumulator, student) => {
          const key = student.department || "Unassigned";
          accumulator[key] = (accumulator[key] || 0) + 1;
          return accumulator;
        }, {});
        const averageCGPA = studentRows.length
          ? studentRows.reduce((sum, student) => sum + (Number(student.cgpa) || 0), 0) / studentRows.length
          : 0;

        if (!mounted) {
          return;
        }

        setStudents(studentRows);
        setAnalytics({
          totalStudents: studentRows.length,
          averageCGPA,
          departmentStats
        });
      } catch (fetchError) {
        if (!mounted) {
          return;
        }
        setError(fetchError.response?.data?.message || "Failed to load admin dashboard.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchBaseData();

    return () => {
      mounted = false;
    };
  }, []);

  async function submitFeedback(studentId) {
    const feedback = String(feedbackDrafts[studentId] || "").trim();

    if (!feedback) {
      setError("Enter feedback before submitting.");
      return;
    }

    try {
      setSavingId(studentId);
      setError("");
      const response = await API.post("/feedback", {
        studentId,
        feedback
      });

      setStudents((current) =>
        current.map((student) =>
          student._id === studentId
            ? {
                ...student,
                mentorReview: response.data?.mentorReview || feedback,
                mentorFeedback: response.data?.mentorFeedback || feedback,
                updatedAt: response.data?.updatedAt || new Date().toISOString()
              }
            : student
        )
      );
      setFeedbackDrafts((current) => ({
        ...current,
        [studentId]: ""
      }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to save feedback.");
    } finally {
      setSavingId("");
    }
  }

  const departmentEntries = useMemo(
    () =>
      Object.entries(analytics.departmentStats || {}).sort((left, right) => right[1] - left[1]),
    [analytics.departmentStats]
  );

  const departmentChartData = useMemo(
    () =>
      departmentEntries.map(([department, count], index) => ({
        department: formatDepartmentLabel(department),
        count,
        fill: departmentColor(index)
      })),
    [departmentEntries]
  );

  const topSkill = useMemo(() => {
    const skillFrequency = students.reduce((accumulator, student) => {
      formatSkills(student.skills).forEach((skill) => {
        accumulator[skill] = (accumulator[skill] || 0) + 1;
      });
      return accumulator;
    }, {});

    return Object.entries(skillFrequency).sort((left, right) => right[1] - left[1])[0] || ["N/A", 0];
  }, [students]);

  const recentStudents = useMemo(
    () =>
      [...students]
        .sort((left, right) => new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime())
        .slice(0, 6),
    [students]
  );

  const insights = useMemo(() => {
    const cgpaBelowEightCount = students.filter((student) => Number(student.cgpa) > 0 && Number(student.cgpa) < 8).length;
    const careerGoalFrequency = students.reduce((accumulator, student) => {
      const goal = formatCamelCase(student.careerGoal || student.careerPath || "");
      if (goal) {
        accumulator[goal] = (accumulator[goal] || 0) + 1;
      }
      return accumulator;
    }, {});
    const sortedCareerGoals = Object.entries(careerGoalFrequency).sort((left, right) => right[1] - left[1]);
    const topDepartment = buildTopEntryLabel(departmentEntries, "No department data", formatDepartmentLabel);
    const topCareerGoal = buildTopEntryLabel(sortedCareerGoals, "No career goals yet");
    const averageCGPA = Number(analytics.averageCGPA || 0).toFixed(2);

    return [
      `${analytics.totalStudents} student${analytics.totalStudents === 1 ? "" : "s"} registered in the platform.`,
      `${topSkill[0]} is the most common skill across current student profiles.`,
      `${cgpaBelowEightCount} student${cgpaBelowEightCount === 1 ? "" : "s"} have CGPA below 8.00.`,
      `${topDepartment} has the highest student concentration.`,
      `${topCareerGoal} is the most common career goal.`,
      `The average CGPA across all students is ${averageCGPA}.`
    ];
  }, [analytics.averageCGPA, analytics.totalStudents, departmentEntries, students, topSkill]);

  return (
    <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 px-6 py-6 shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.18),transparent_30%)]" />
            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Admin Dashboard</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Manage students, departments, and academic insights.</h1>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Track student progress, review department distribution, and send targeted mentor feedback from one
                  clean workspace.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Student Base</p>
                  <p className="mt-2 text-lg font-semibold text-white">{loading ? "..." : analytics.totalStudents}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Average CGPA</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {loading ? "..." : Number(analytics.averageCGPA || 0).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top Skill</p>
                  <p className="mt-2 text-lg font-semibold text-white">{topSkill[0]}</p>
                </div>
              </div>
            </div>
          </section>

          {error ? (
            <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AnalyticsCard
              title="Total Students"
              value={loading ? "..." : analytics.totalStudents}
              subtitle="Active student records"
              icon={FiUsers}
            />
            <AnalyticsCard
              title="Average CGPA"
              value={loading ? "..." : Number(analytics.averageCGPA || 0).toFixed(2)}
              subtitle="Academic performance"
              icon={FiActivity}
              accent="from-blue-500/20 to-indigo-400/20"
            />
            <AnalyticsCard
              title="Departments"
              value={loading ? "..." : Object.keys(analytics.departmentStats || {}).length || 0}
              subtitle="Programs represented"
              icon={FiBarChart2}
              accent="from-emerald-500/20 to-cyan-400/20"
            />
            <AnalyticsCard
              title="Top Skill"
              value={loading ? "..." : topSkill[0]}
              subtitle={loading ? "Loading..." : `${topSkill[1]} student${topSkill[1] === 1 ? "" : "s"}`}
              icon={FiAward}
              accent="from-amber-500/20 to-orange-400/20"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Student Distribution by Department</h2>
                  <p className="mt-1 text-sm text-slate-400">Department mix across the current student dataset.</p>
                </div>
                <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                  Live Overview
                </span>
              </div>

              <div className="mt-6 h-[280px]">
                {departmentChartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentChartData} barCategoryGap={24}>
                      <CartesianGrid stroke="rgba(148, 163, 184, 0.18)" vertical={false} />
                      <XAxis dataKey="department" stroke="#94a3b8" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} stroke="#94a3b8" tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                        contentStyle={{
                          background: "rgba(15, 23, 42, 0.95)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "16px",
                          color: "#e5e7eb"
                        }}
                      />
                      <Bar dataKey="count" radius={[12, 12, 0, 0]}>
                        {departmentChartData.map((entry) => (
                          <Cell key={entry.department} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-400">
                    No department data available.
                  </div>
                )}
              </div>
            </article>

            <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-white">Department Count</h2>
              <p className="mt-1 text-sm text-slate-400">Quick view of student totals per department.</p>

              <div className="mt-5 flex flex-wrap gap-3">
                {departmentEntries.length ? (
                  departmentEntries.map(([department, count], index) => (
                    <div
                      key={department}
                      className="rounded-full border px-4 py-2 text-sm font-medium shadow-[0_10px_25px_rgba(15,23,42,0.18)]"
                      style={{
                        borderColor: `${departmentColor(index)}55`,
                        backgroundColor: `${departmentColor(index)}18`,
                        color: departmentColor(index)
                      }}
                    >
                      {formatDepartmentLabel(department)} • {count} Student{count === 1 ? "" : "s"}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No student records available.</p>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Recent Activity</p>
                <div className="mt-4 space-y-3">
                  {recentStudents.length ? (
                    recentStudents.map((student) => (
                      <div key={student._id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-white">{formatCamelCase(student.name) || "N/A"}</p>
                          <p className="text-xs text-slate-400">
                            {formatDepartmentLabel(student.department)} • {student.registerNumber || "No register number"}
                          </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                          {Number(student.cgpa || 0).toFixed(2)} CGPA
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No recent student records available.</p>
                  )}
                </div>
              </div>
            </article>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">AI Insights</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Automatically generated observations from the current student dataset.
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200 shadow-[0_0_20px_rgba(56,189,248,0.18)]">
                <FiCpu className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {insights.map((insight, index) => (
                <div
                  key={`${insight}-${index}`}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3"
                >
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.6)]" />
                  <p className="text-sm leading-6 text-slate-200">{insight}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Students</h2>
                <p className="mt-1 text-sm text-slate-400">Review student skills, goals, and mentor feedback in one table.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/20 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                <FiBookOpen className="h-4 w-4" />
                Mentorship Workspace
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-950/35 text-slate-300">
                    <tr>
                      <th className="px-4 py-4 font-medium">Name</th>
                      <th className="px-4 py-4 font-medium">Register Number</th>
                      <th className="px-4 py-4 font-medium">Department</th>
                      <th className="px-4 py-4 font-medium">Skills</th>
                      <th className="px-4 py-4 font-medium">Career Goal</th>
                      <th className="px-4 py-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const studentSkills = formatSkills(student.skills);
                      return (
                        <tr
                          key={student._id}
                          className="border-t border-white/10 bg-white/[0.02] transition-colors hover:bg-white/[0.05]"
                        >
                          <td className="px-4 py-4 text-white">{formatCamelCase(student.name) || "N/A"}</td>
                          <td className="px-4 py-4 text-slate-300">{student.registerNumber || "N/A"}</td>
                          <td className="px-4 py-4 text-slate-300">{formatDepartmentLabel(student.department) || "N/A"}</td>
                          <td className="px-4 py-4">
                            {studentSkills.length ? (
                              <div className="flex max-w-[280px] flex-wrap gap-2">
                                {studentSkills.map((skill, index) => (
                                  <span
                                    key={`${student._id}-skill-${index}`}
                                    className="rounded-full border border-blue-400/25 bg-blue-500/10 px-3 py-1 text-xs font-medium text-[#9fd1ff]"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-500">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-slate-300">
                            {formatCamelCase(student.careerGoal || student.careerPath) || "N/A"}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex min-w-[320px] items-start gap-2">
                              <div className="relative flex-1">
                                <FiMessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <input
                                  type="text"
                                  value={feedbackDrafts[student._id] || ""}
                                  onChange={(event) =>
                                    setFeedbackDrafts((current) => ({
                                      ...current,
                                      [student._id]: event.target.value
                                    }))
                                  }
                                  placeholder={formatCamelCase(student.mentorFeedback || student.mentorReview) || "Give feedback"}
                                  className="w-full rounded-xl border border-white/10 bg-slate-950/35 py-2.5 pl-10 pr-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => submitFeedback(student._id)}
                                disabled={savingId === student._id}
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {savingId === student._id ? "Saving..." : "Give Feedback"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!students.length ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-slate-400" colSpan={6}>
                          No students found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
    </div>
  );
}

export default AdminDashboard;
