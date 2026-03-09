import { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import SidebarNavigation from "./SidebarNavigation";
import DashboardHeader from "./DashboardHeader";
import AnalyticsCards from "./AnalyticsCards";
import RecommendationTrends from "./RecommendationTrends";
import RecentRegistrationsTable from "./RecentRegistrationsTable";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    completedProfiles: 0,
    mostRecommendedCareer: "Software Engineer",
    recentUsers: []
  });

  useEffect(() => {
    let isMounted = true;

    async function loadAdminAnalytics() {
      try {
        setLoading(true);
        setError("");
        const response = await axiosClient.get("/admin/analytics");
        if (!isMounted) {
          return;
        }

        const data = response.data || {};
        setAnalytics({
          totalUsers: data.totalUsers || 0,
          completedProfiles: data.completedProfiles || 0,
          mostRecommendedCareer: data.mostRecommendedCareer || "Software Engineer",
          recentUsers: data.recentUsers || []
        });
      } catch (requestError) {
        if (!isMounted) {
          return;
        }
        setError(requestError.response?.data?.message || "Unable to load admin analytics.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAdminAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="section-shell py-6 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <SidebarNavigation />

        <main className="space-y-6">
          <DashboardHeader />
          {error ? <section className="card-container rounded-2xl border-red-400/40 p-4 text-sm text-red-200">{error}</section> : null}
          <AnalyticsCards
            totalUsers={analytics.totalUsers}
            completedProfiles={analytics.completedProfiles}
            mostRecommendedCareer={analytics.mostRecommendedCareer}
            loading={loading}
          />
          <RecommendationTrends />
          <RecentRegistrationsTable rows={analytics.recentUsers} loading={loading} />
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
