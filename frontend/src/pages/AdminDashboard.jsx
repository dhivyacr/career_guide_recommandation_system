import { useEffect, useState } from "react";
import AnalyticsCard from "../components/AnalyticsCard";
import { getAdminAnalytics } from "../services/adminService";
import AdminSidebar from "../components/AdminSidebar";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    completedProfiles: 0,
    mostRecommendedCareer: "N/A"
  });

  useEffect(() => {
    let mounted = true;

    async function fetchBaseData() {
      try {
        setLoading(true);
        setError("");
        const analyticsResponse = await getAdminAnalytics();

        if (!mounted) {
          return;
        }

        setAnalytics({
          totalStudents: analyticsResponse.data?.totalStudents || 0,
          completedProfiles: analyticsResponse.data?.completedProfiles || 0,
          mostRecommendedCareer: analyticsResponse.data?.mostRecommendedCareer || "N/A"
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
              <AnalyticsCard title="Profiles Completed" value={loading ? "..." : analytics.completedProfiles} />
              <AnalyticsCard title="Most Recommended Career" value={loading ? "..." : analytics.mostRecommendedCareer} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
