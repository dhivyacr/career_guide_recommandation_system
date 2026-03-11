import { useEffect, useState } from "react";
import AnalyticsCard from "../components/AnalyticsCard";
import AdminSidebar from "../components/AdminSidebar";
import API from "../services/api";

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

  return (
    <div className="min-h-screen bg-[#071a2f] text-[#e5e7eb]">
      <div className="mx-auto flex max-w-[1400px] gap-6 p-6">
        <AdminSidebar />

        <main className="flex-1 space-y-6">
          {error ? <p className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
          <section className="space-y-5">
            <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-3">
              <AnalyticsCard title="Total Students" value={loading ? "..." : analytics.totalStudents} />
              <AnalyticsCard title="Average CGPA" value={loading ? "..." : Number(analytics.averageCGPA || 0).toFixed(2)} />
              <AnalyticsCard
                title="Departments"
                value={
                  loading
                    ? "..."
                    : Object.keys(analytics.departmentStats || {}).length || 0
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-5 shadow-[0_0_20px_rgba(59,130,246,0.12)]">
            <h2 className="text-lg font-semibold text-white">Department Count</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {Object.entries(analytics.departmentStats || {}).length ? (
                Object.entries(analytics.departmentStats).map(([department, count]) => (
                  <div key={department} className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-[#d9e6fb]">
                    {department}: {count}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#9cb2d1]">No student records available.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-5 shadow-[0_0_20px_rgba(59,130,246,0.12)]">
            <h2 className="text-lg font-semibold text-white">Students</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[#9cb2d1]">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Register Number</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Skills</th>
                    <th className="px-3 py-2">Career Goal</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className="border-t border-white/10">
                      <td className="px-3 py-3">{student.name || "N/A"}</td>
                      <td className="px-3 py-3">{student.registerNumber || "N/A"}</td>
                      <td className="px-3 py-3">{student.department || "N/A"}</td>
                      <td className="px-3 py-3">{(student.skills || []).join(", ") || "N/A"}</td>
                      <td className="px-3 py-3">{student.careerGoal || student.careerPath || "N/A"}</td>
                      <td className="px-3 py-3">
                        <div className="flex min-w-[260px] gap-2">
                          <input
                            type="text"
                            value={feedbackDrafts[student._id] || ""}
                            onChange={(event) =>
                              setFeedbackDrafts((current) => ({
                                ...current,
                                [student._id]: event.target.value
                              }))
                            }
                            placeholder={student.mentorFeedback || student.mentorReview || "Give feedback"}
                            className="w-full rounded-lg border border-white/10 bg-[#0b1f36] px-3 py-2 text-white outline-none placeholder:text-[#8da7c9]"
                          />
                          <button
                            type="button"
                            onClick={() => submitFeedback(student._id)}
                            disabled={savingId === student._id}
                            className="rounded-lg bg-[#3b82f6] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                          >
                            {savingId === student._id ? "Saving..." : "Give Feedback"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!students.length ? (
                    <tr>
                      <td className="px-3 py-3 text-[#9cb2d1]" colSpan={6}>
                        No students found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
