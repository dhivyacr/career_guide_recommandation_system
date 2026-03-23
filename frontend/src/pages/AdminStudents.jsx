import { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiFilter, FiSearch, FiStar, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getStudents } from "../services/adminService";

const DEPARTMENT_OPTIONS = ["All", "AIML", "CSE", "IT", "ECE"];
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

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function AdminStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [cgpaFilter, setCgpaFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);
  const [averageCGPA, setAverageCGPA] = useState(0);
  const [departmentCounts, setDepartmentCounts] = useState({});

  useEffect(() => {
    let mounted = true;

    async function fetchStudents() {
      try {
        const res = await getStudents();
        if (!mounted) {
          return;
        }

        const normalizedStudents = Array.isArray(res.data) ? res.data : res.data?.students || [];
        const uniqueStudents = [
          ...new Map(
            normalizedStudents.map((student) => [
              student._id || student.userId || student.registerNumber || student.regNo || student.email,
              {
                ...student,
                registerNumber: student.registerNumber || student.regNo || "",
                department: student.department || student.degree || "N/A",
                cgpa: Number(student.cgpa ?? student.gpa ?? 0) || 0,
                lastUpdated: student.lastUpdated || student.updatedAt || student.createdAt || null
              }
            ])
          ).values()
        ];

        const computedDepartmentCounts = uniqueStudents.reduce((accumulator, student) => {
          const department = student.department || "Unassigned";
          accumulator[department] = (accumulator[department] || 0) + 1;
          return accumulator;
        }, {});

        const computedAverageCGPA = uniqueStudents.length
          ? uniqueStudents.reduce((sum, student) => sum + (Number(student.cgpa) || 0), 0) / uniqueStudents.length
          : 0;

        setStudents(uniqueStudents);
        setTotalStudents(Array.isArray(res.data) ? uniqueStudents.length : res.data?.totalStudents ?? uniqueStudents.length);
        setAverageCGPA(
          Array.isArray(res.data)
            ? computedAverageCGPA
            : Number(res.data?.avgCGPA ?? res.data?.averageCGPA ?? computedAverageCGPA) || 0
        );
        setDepartmentCounts(Array.isArray(res.data) ? computedDepartmentCounts : res.data?.departmentStats || computedDepartmentCounts);
      } catch (fetchError) {
        if (!mounted) {
          return;
        }
        setError(fetchError.response?.data?.message || "Failed to fetch students");
      }
    }

    fetchStudents();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredStudents = useMemo(
    () =>
      students.filter((student) => {
        const query = search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          String(student.name || "")
            .toLowerCase()
            .includes(query) ||
          String(student.registerNumber || "")
            .toLowerCase()
            .includes(query) ||
          String(student.department || "")
            .toLowerCase()
            .includes(query);

        const matchesDepartment = departmentFilter === "All" || student.department === departmentFilter;
        const matchesCgpa =
          cgpaFilter === "All" ||
          (cgpaFilter === "9+" && Number(student.cgpa) >= 9) ||
          (cgpaFilter === "8-8.99" && Number(student.cgpa) >= 8 && Number(student.cgpa) < 9) ||
          (cgpaFilter === "Below 8" && Number(student.cgpa) < 8);
        const normalizedSkillFilter = skillFilter.trim().toLowerCase();
        const matchesSkill =
          !normalizedSkillFilter ||
          formatSkills(student.skills)
            .join(" ")
            .toLowerCase()
            .includes(normalizedSkillFilter);

        return matchesSearch && matchesDepartment && matchesCgpa && matchesSkill;
      }),
    [cgpaFilter, departmentFilter, search, skillFilter, students]
  );

  const sortedStudents = useMemo(
    () =>
      [...filteredStudents].sort((a, b) => {
        if (b.cgpa === a.cgpa) {
          return new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime();
        }
        return b.cgpa - a.cgpa;
      }),
    [filteredStudents]
  );

  const topPerformer = useMemo(
    () =>
      students.reduce(
        (top, student) => ((Number(student.cgpa) || 0) > (Number(top.cgpa) || 0) ? student : top),
        students[0] || { name: "N/A", cgpa: 0 }
      ),
    [students]
  );

  const leaderboard = useMemo(
    () =>
      [...students]
        .sort((a, b) => {
          if (b.cgpa === a.cgpa) {
            return new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime();
          }
          return b.cgpa - a.cgpa;
        })
        .slice(0, 5),
    [students]
  );

  return (
    <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 px-6 py-6 shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.18),transparent_30%)]" />
            <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Students</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Track student records with cleaner visibility.</h1>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Search faster, filter by department, and review mentor ownership, CGPA, and skill snapshots in one
                  place.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Visible Students</p>
                  <p className="mt-2 text-lg font-semibold text-white">{sortedStudents.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Average CGPA</p>
                  <p className="mt-2 text-lg font-semibold text-white">{averageCGPA.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top Performer</p>
                  <p className="mt-2 text-lg font-semibold text-white">{formatCamelCase(topPerformer.name) || "N/A"}</p>
                </div>
              </div>
            </div>
          </section>

          {error ? (
            <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>
          ) : null}

          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-300">Total Students</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{totalStudents}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200">
                  <FiUsers className="h-5 w-5" />
                </div>
              </div>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-300">Average CGPA</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{averageCGPA.toFixed(2)}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-emerald-200">
                  <FiStar className="h-5 w-5" />
                </div>
              </div>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
              <p className="text-sm text-slate-300">Departments</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.keys(departmentCounts).length ? (
                  Object.entries(departmentCounts).map(([department, count]) => (
                    <span
                      key={department}
                      className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200"
                    >
                      {formatCamelCase(department)} • {count}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">No department stats</span>
                )}
              </div>
            </article>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-amber-200">
                <FiStar className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Top Students Leaderboard</h2>
                <p className="text-sm text-slate-400">Highest CGPA performers across the current student dataset.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {leaderboard.length ? (
                leaderboard.map((student, index) => (
                  <div
                    key={student._id || student.userId || student.registerNumber || student.email}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 text-center text-xl">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{formatCamelCase(student.name) || "N/A"}</p>
                        <p className="text-xs text-slate-400">
                          {student.registerNumber || "N/A"} • {formatCamelCase(student.department) || "N/A"}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-200">
                      {student.cgpa ? student.cgpa.toFixed(2) : "0.00"} CGPA
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No leaderboard data available.</p>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Student Directory</h2>
                <p className="mt-1 text-sm text-slate-400">Modernized table with cleaner filters and badge-based skills.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="relative">
                  <FiSearch className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name, register number, or department..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/35 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                  />
                </div>

                <div className="relative">
                  <FiFilter className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-slate-950/35 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-cyan-400/50"
                  >
                    {DEPARTMENT_OPTIONS.map((department) => (
                      <option key={department} value={department}>
                        {department === "All" ? "All Departments" : department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <FiFilter className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <select
                    value={cgpaFilter}
                    onChange={(e) => setCgpaFilter(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-slate-950/35 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-cyan-400/50"
                  >
                    <option value="All">All CGPA</option>
                    <option value="9+">9.0 and above</option>
                    <option value="8-8.99">8.0 - 8.99</option>
                    <option value="Below 8">Below 8.0</option>
                  </select>
                </div>

                <div className="relative">
                  <FiSearch className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter by skill..."
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/35 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                  />
                </div>
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
                      <th className="px-4 py-4 font-medium">Mentor</th>
                      <th className="px-4 py-4 font-medium">Skills</th>
                      <th className="px-4 py-4 font-medium">CGPA</th>
                      <th className="px-4 py-4 font-medium">Last Updated</th>
                      <th className="px-4 py-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStudents.map((student) => (
                      <tr
                        key={student._id || student.userId || student.registerNumber || student.email}
                        className="border-t border-white/10 bg-white/[0.02] transition-colors hover:bg-white/[0.05]"
                      >
                        <td className="px-4 py-4">
                          <span className="font-medium text-white">{formatCamelCase(student.name) || "N/A"}</span>
                        </td>
                        <td className="px-4 py-4 text-slate-300">{student.registerNumber || "N/A"}</td>
                        <td className="px-4 py-4 text-slate-300">{formatCamelCase(student.department) || "N/A"}</td>
                        <td className="px-4 py-4 text-slate-300">
                          {formatCamelCase(student.mentorName || student.mentor?.name) || "Unassigned"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex max-w-[260px] flex-wrap gap-2">
                            {formatSkills(student.skills).length ? (
                              formatSkills(student.skills).map((skill, index) => (
                                <span
                                  key={`${student._id}-skill-${index}`}
                                  className="rounded-full border border-blue-400/25 bg-blue-500/10 px-3 py-1 text-xs font-medium text-[#9fd1ff]"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-300">{student.cgpa ? student.cgpa.toFixed(2) : "0.00"}</td>
                        <td className="px-4 py-4 text-slate-300">{formatDate(student.lastUpdated)}</td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/student/${student.registerNumber}`)}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.28)] transition hover:brightness-110"
                          >
                            View
                            <FiArrowRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!sortedStudents.length ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-slate-400" colSpan={8}>
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

export default AdminStudents;
