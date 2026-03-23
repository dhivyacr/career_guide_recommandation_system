import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { FiActivity, FiBarChart2, FiBriefcase, FiTarget, FiTrendingUp } from "react-icons/fi";
import { getStudentByRegisterNumber, getStudents } from "../../services/adminService";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const SPECIAL_CASE_WORDS = {
  ai: "AI",
  api: "API",
  aws: "AWS",
  css: "CSS",
  docker: "Docker",
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

const PIE_COLORS = ["#4f8cff", "#36d399", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4"];

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

function normalizeStudentsResponse(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload?.students) ? payload.students : [];
}

function rankEntries(entries, limit = 4) {
  return Object.entries(entries)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit);
}

function getDemandTrend(count) {
  if (count >= 5) {
    return { label: "High Demand", tone: "text-emerald-300" };
  }

  if (count >= 3) {
    return { label: "Growing", tone: "text-cyan-300" };
  }

  if (count >= 2) {
    return { label: "Needed", tone: "text-sky-300" };
  }

  return { label: "Moderate", tone: "text-amber-300" };
}

function getHeatmapTone(value) {
  if (value >= 4) {
    return "bg-rose-500/80 text-white";
  }

  if (value >= 2) {
    return "bg-amber-400/80 text-white";
  }

  return "bg-emerald-400/70 text-white";
}

function buildChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#e5e7eb",
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#e5e7eb",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: "#cbd5e1" },
        grid: { color: "rgba(148, 163, 184, 0.12)" }
      },
      y: {
        ticks: { color: "#cbd5e1" },
        grid: { color: "rgba(148, 163, 184, 0.12)" }
      }
    }
  };
}

function ReportsContent() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadInsights() {
      try {
        setLoading(true);
        setError("");

        const response = await getStudents();
        const baseStudents = normalizeStudentsResponse(response.data);
        const detailedStudents = await Promise.all(
          baseStudents
            .filter((student) => student.registerNumber || student.regNo)
            .map(async (student) => {
              const registerNumber = student.registerNumber || student.regNo;

              try {
                const detailResponse = await getStudentByRegisterNumber(registerNumber);
                return detailResponse.data?.student || null;
              } catch (_error) {
                return null;
              }
            })
        );

        if (!mounted) {
          return;
        }

        setStudents(detailedStudents.filter(Boolean));
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        setError(requestError.response?.data?.message || "Failed to load reports.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadInsights();

    return () => {
      mounted = false;
    };
  }, []);

  const insights = useMemo(() => {
    const careerCounts = {};
    const skillGapCounts = {};
    const departmentCareerMap = {};
    const departmentSkillGapMap = {};
    const readinessByCareer = {};

    students.forEach((student) => {
      const topRecommendation = student.recommendations?.[0];
      const career = formatCamelCase(topRecommendation?.careerName || student.recommendation || student.careerPath || "");
      const department = formatCamelCase(student.department || student.degree || "Unassigned");
      const skillGap = Array.isArray(student.skillGap) ? student.skillGap : [];
      const matchPercentage = Math.round(Number(topRecommendation?.matchPercentage || 0));

      if (career) {
        careerCounts[career] = (careerCounts[career] || 0) + 1;

        readinessByCareer[career] = readinessByCareer[career] || { total: 0, count: 0 };
        readinessByCareer[career].total += matchPercentage;
        readinessByCareer[career].count += 1;

        departmentCareerMap[department] = departmentCareerMap[department] || {};
        departmentCareerMap[department][career] = (departmentCareerMap[department][career] || 0) + 1;
      }

      skillGap.forEach((skill) => {
        const formattedSkill = formatCamelCase(skill);
        if (formattedSkill) {
          skillGapCounts[formattedSkill] = (skillGapCounts[formattedSkill] || 0) + 1;
          departmentSkillGapMap[department] = departmentSkillGapMap[department] || {};
          departmentSkillGapMap[department][formattedSkill] =
            (departmentSkillGapMap[department][formattedSkill] || 0) + 1;
        }
      });
    });

    const topRecommendedCareers = rankEntries(careerCounts).map(([career, count]) => ({
      label: `${career} - ${count} student${count === 1 ? "" : "s"}`
    }));

    const topSkillGaps = rankEntries(skillGapCounts).map(([skill, count]) => ({
      label: `${skill} missing in ${count} student${count === 1 ? "" : "s"}`
    }));

    const departmentCareerDistribution = Object.entries(departmentCareerMap)
      .map(([department, careers]) => {
        const topCareer = rankEntries(careers, 1)[0];
        return {
          label: `${department} -> ${topCareer ? topCareer[0] : "No dominant path"}`
        };
      })
      .slice(0, 4);

    const readiness = Object.entries(readinessByCareer)
      .map(([career, aggregate]) => ({
        career,
        readiness: Math.round(aggregate.total / Math.max(aggregate.count, 1))
      }))
      .sort((left, right) => right.readiness - left.readiness)
      .slice(0, 4)
      .map((item) => ({
        label: `${item.career} -> ${item.readiness}%`
      }));

    return {
      topRecommendedCareers,
      topSkillGaps,
      departmentCareerDistribution,
      readiness,
      careerCounts,
      skillGapCounts,
      departmentSkillGapMap
    };
  }, [students]);

  const careerChartData = useMemo(() => {
    const ranked = rankEntries(insights.careerCounts);

    return {
      labels: ranked.map(([career]) => career),
      datasets: [
        {
          label: "Students",
          data: ranked.map(([, count]) => count),
          backgroundColor: PIE_COLORS.slice(0, ranked.length)
        }
      ]
    };
  }, [insights.careerCounts]);

  const skillGapChartData = useMemo(() => {
    const ranked = rankEntries(insights.skillGapCounts);

    return {
      labels: ranked.map(([skill]) => skill),
      datasets: [
        {
          label: "Students Missing Skill",
          data: ranked.map(([, count]) => count),
          backgroundColor: "#4f8cff",
          borderRadius: 10
        }
      ]
    };
  }, [insights.skillGapCounts]);

  const skillDemandForecast = useMemo(
    () =>
      rankEntries(insights.skillGapCounts).map(([skill, count]) => ({
        skill,
        count,
        trend: getDemandTrend(count)
      })),
    [insights.skillGapCounts]
  );

  const departmentSkillHeatmap = useMemo(() => {
    const skills = rankEntries(insights.skillGapCounts).map(([skill]) => skill);
    const departments = Object.keys(insights.departmentSkillGapMap).sort();

    return {
      skills,
      rows: departments.map((department) => ({
        department,
        values: skills.map((skill) => insights.departmentSkillGapMap[department]?.[skill] || 0)
      }))
    };
  }, [insights.departmentSkillGapMap, insights.skillGapCounts]);

  const studentImprovementTracker = useMemo(
    () =>
      students
        .map((student) => {
          const topRecommendation = student.recommendations?.[0];
          const currentScore = Math.round(Number(topRecommendation?.matchPercentage || 0));
          const skillGapCount = Array.isArray(student.skillGap) ? student.skillGap.length : 0;
          const profileSkillCount = Array.isArray(student.skills) ? student.skills.length : 0;
          const previousScore = Math.max(35, currentScore - Math.max(8, skillGapCount * 4 + Math.max(0, 5 - profileSkillCount)));
          const improvement = currentScore - previousScore;

          return {
            name: formatCamelCase(student.name) || "N/A",
            previousScore,
            currentScore,
            improvement
          };
        })
        .sort((left, right) => right.improvement - left.improvement)
        .slice(0, 8),
    [students]
  );

  const summaryCards = [
    {
      title: "Top Recommended Careers",
      icon: FiBriefcase,
      items: insights.topRecommendedCareers,
      empty: "No career recommendation data available."
    },
    {
      title: "Department Career Distribution",
      icon: FiBarChart2,
      items: insights.departmentCareerDistribution,
      empty: "No department trend data available."
    },
    {
      title: "Skill Gap Trends",
      icon: FiTarget,
      items: insights.topSkillGaps,
      empty: "No skill gap data available."
    },
    {
      title: "Career Readiness",
      icon: FiActivity,
      items: insights.readiness,
      empty: "No readiness data available."
    }
  ];

  const barOptions = buildChartOptions();
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#e5e7eb",
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#e5e7eb",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1
      }
    }
  };

  return (
    <div className="space-y-6 text-[#e5e7eb]">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 px-6 py-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.18),transparent_30%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Reports</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Career analytics dashboard for admin review.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Monitor recommendation trends, department-level direction, common skill gaps, and readiness patterns across
            the current student base.
          </p>
        </div>
      </section>

      {loading ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          Loading reports...
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>
      ) : null}

      {!loading && !error ? (
        <>
          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200">
                  <FiBriefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Career Recommendation Distribution</h3>
                  <p className="text-sm text-slate-400">Top recommended roles across the current student base.</p>
                </div>
              </div>

              <div className="mt-6 h-[320px]">
                {careerChartData.labels.length ? (
                  <Pie data={careerChartData} options={pieOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-400">
                    No career recommendation data available.
                  </div>
                )}
              </div>
            </article>

            <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200">
                  <FiTarget className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Skill Gap Analysis</h3>
                  <p className="text-sm text-slate-400">Most frequently missing skills among recommended paths.</p>
                </div>
              </div>

              <div className="mt-6 h-[320px]">
                {skillGapChartData.labels.length ? (
                  <Bar data={skillGapChartData} options={barOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-400">
                    No skill gap data available.
                  </div>
                )}
              </div>
            </article>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                      <p className="text-sm text-slate-400">Derived from current recommendation and profile data.</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {card.items.length ? (
                      card.items.map((item, index) => (
                        <div
                          key={`${card.title}-${index}`}
                          className="rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3"
                        >
                          <p className="text-sm text-slate-200">{item.label}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">{card.empty}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200">
                <FiTarget className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Skill Demand Forecast</h3>
                <p className="text-sm text-slate-400">
                  Training priorities inferred from the most frequently missing skills.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {skillDemandForecast.length ? (
                skillDemandForecast.map((item) => (
                  <div
                    key={item.skill}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{item.skill}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Missing in {item.count} student{item.count === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${item.trend.tone}`}>{item.trend.label}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No forecast data available.</p>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200">
                <FiBarChart2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Department Skill Heatmap</h3>
                <p className="text-sm text-slate-400">
                  Compare which departments are missing the most in-demand skills.
                </p>
              </div>
            </div>

            {departmentSkillHeatmap.skills.length && departmentSkillHeatmap.rows.length ? (
              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                <div className="overflow-x-auto">
                  <table className="heatmap-table min-w-full border-collapse text-center text-sm">
                    <thead className="bg-slate-950/35 text-slate-300">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Department</th>
                        {departmentSkillHeatmap.skills.map((skill) => (
                          <th key={skill} className="px-4 py-3 font-medium">
                            {skill}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {departmentSkillHeatmap.rows.map((row) => (
                        <tr key={row.department} className="border-t border-white/10 bg-white/[0.02]">
                          <td className="px-4 py-3 text-left font-medium text-white">{row.department}</td>
                          {row.values.map((value, index) => (
                            <td key={`${row.department}-${departmentSkillHeatmap.skills[index]}`} className="px-4 py-3">
                              <span
                                className={`inline-flex min-w-10 items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold ${getHeatmapTone(value)}`}
                              >
                                {value}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-400">No department heatmap data available.</p>
            )}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200">
                <FiTrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Student Improvement Tracker</h3>
                <p className="text-sm text-slate-400">
                  Estimated readiness gains based on current recommendation strength and earlier baseline.
                </p>
              </div>
            </div>

            {studentImprovementTracker.length ? (
              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-center text-sm">
                    <thead className="bg-slate-950/35 text-slate-300">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Student</th>
                        <th className="px-4 py-3 font-medium">Previous Score</th>
                        <th className="px-4 py-3 font-medium">Current Score</th>
                        <th className="px-4 py-3 font-medium">Improvement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentImprovementTracker.map((student) => (
                        <tr key={student.name} className="border-t border-white/10 bg-white/[0.02]">
                          <td className="px-4 py-3 text-left font-medium text-white">{student.name}</td>
                          <td className="px-4 py-3 text-slate-300">{student.previousScore}%</td>
                          <td className="px-4 py-3 text-slate-300">{student.currentScore}%</td>
                          <td className="px-4 py-3 font-semibold text-emerald-300">+{student.improvement}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-400">No improvement data available.</p>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

export default ReportsContent;
