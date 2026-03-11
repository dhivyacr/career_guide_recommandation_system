import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { getStudents } from "../services/adminService";

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

const DEPARTMENT_OPTIONS = ["All", "AIML", "CSE", "IT", "ECE"];

function AdminStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
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

  const filteredStudents = students.filter((student) => {
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

    return matchesSearch && matchesDepartment;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (b.cgpa === a.cgpa) {
      return new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime();
    }
    return b.cgpa - a.cgpa;
  });

  const topPerformer = students.reduce(
    (top, student) => ((Number(student.cgpa) || 0) > (Number(top.cgpa) || 0) ? student : top),
    students[0] || { name: "N/A", cgpa: 0 }
  );

  return (
    <div className="min-h-screen bg-[#071a2f] text-[#e5e7eb]">
      <div className="mx-auto flex max-w-[1400px] gap-6 p-6">
        <AdminSidebar />

        <main className="flex-1 space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Students Dashboard</h2>
              <p className="mt-1 text-sm text-[#9cb2d1]">
                {sortedStudents.length} student{sortedStudents.length === 1 ? "" : "s"} visible
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Search by name, register number, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0f2747] px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
              />

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0f2747] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-400/60"
              >
                {DEPARTMENT_OPTIONS.map((department) => (
                  <option key={department} value={department}>
                    {department === "All" ? "All Departments" : department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-white/5 bg-[#0f2747] p-5 shadow-[0_0_20px_rgba(59,130,246,0.12)]">
              <p className="text-sm text-[#9cb2d1]">Total Students</p>
              <p className="mt-2 text-3xl font-semibold text-white">{totalStudents}</p>
            </article>

            <article className="rounded-2xl border border-white/5 bg-[#0f2747] p-5 shadow-[0_0_20px_rgba(59,130,246,0.12)]">
              <p className="text-sm text-[#9cb2d1]">Average CGPA</p>
              <p className="mt-2 text-3xl font-semibold text-white">{averageCGPA.toFixed(2)}</p>
            </article>

            <article className="rounded-2xl border border-white/5 bg-[#0f2747] p-5 shadow-[0_0_20px_rgba(59,130,246,0.12)]">
              <p className="text-sm text-[#9cb2d1]">Top Performer</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {topPerformer.name || "N/A"}{" "}
                <span className="text-sm font-normal text-[#9cb2d1]">({Number(topPerformer.cgpa || 0).toFixed(2)})</span>
              </p>
            </article>
          </section>

          <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-5 shadow-[0_0_20px_rgba(59,130,246,0.12)]">
            <h3 className="text-base font-semibold text-white">Department-wise Student Count</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {Object.keys(departmentCounts).length ? (
                Object.entries(departmentCounts).map(([department, count]) => (
                  <div key={department} className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-[#d9e6fb]">
                    {department}: {count} student{count === 1 ? "" : "s"}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#aab9cf]">No department statistics available.</p>
              )}
            </div>
          </section>

          <div className="rounded-2xl border border-white/5 bg-[#0f2747] p-4 shadow-[0_0_20px_rgba(59,130,246,0.12)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[#9cb2d1]">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Register Number</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Mentor</th>
                    <th className="px-3 py-2">CGPA</th>
                    <th className="px-3 py-2">Last Updated</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((student) => (
                    <tr key={student._id || student.userId || student.registerNumber || student.email} className="border-t border-white/10">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span>{student.name || "N/A"}</span>
                          {student.cgpa >= 9 ? (
                            <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                              Top Performer
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-3">{student.registerNumber || "N/A"}</td>
                      <td className="px-3 py-3">{student.department || "N/A"}</td>
                      <td className="px-3 py-3">{student.mentor?.name || "Unassigned"}</td>
                      <td className="px-3 py-3">{student.cgpa ? student.cgpa.toFixed(2) : "0.00"}</td>
                      <td className="px-3 py-3">{formatDate(student.lastUpdated)}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/student/${student.registerNumber}`)}
                          className="rounded-lg bg-[#3b82f6] px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!sortedStudents.length ? (
                    <tr>
                      <td className="px-3 py-3 text-[#aab9cf]" colSpan={7}>
                        No students found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminStudents;
