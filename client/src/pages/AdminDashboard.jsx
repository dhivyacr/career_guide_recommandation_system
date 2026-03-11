import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [performance, setPerformance] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      const [dashboardResponse, performanceResponse] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/student-performance")
      ]);

      setDashboard(dashboardResponse.data);
      setPerformance(performanceResponse.data.students || []);
    }

    loadDashboard();
  }, []);

  return (
    <Layout title="Admin Dashboard">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Total Students</p>
          <p className="mt-2 text-3xl font-semibold">{dashboard?.totalStudents ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Total Mentors</p>
          <p className="mt-2 text-3xl font-semibold">{dashboard?.totalMentors ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">System Status</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">Active</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold">Students per Mentor</h2>
          <div className="mt-4 space-y-4">
            {(dashboard?.mentorDistribution || []).map((item) => (
              <div key={item.mentor}>
                <div className="mb-2 flex justify-between text-sm text-slate-300">
                  <span>{item.mentor}</span>
                  <span>{item.students}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800">
                  <div className="h-3 rounded-full bg-sky-500" style={{ width: `${(item.students / 20) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold">Student Performance Graph</h2>
          <div className="mt-4 space-y-3">
            {performance.map((student) => (
              <div key={student.email}>
                <div className="mb-1 flex justify-between text-sm text-slate-300">
                  <span>{student.name}</span>
                  <span>{student.score}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800">
                  <div className="h-3 rounded-full bg-emerald-400" style={{ width: `${student.score}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-500">Mentor: {student.mentor}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default AdminDashboard;
