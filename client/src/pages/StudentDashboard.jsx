import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const email = user?.email || JSON.parse(localStorage.getItem("user") || "null")?.email;
        const profileResponse = email ? await api.get(`/student/profile/${encodeURIComponent(email)}`) : await api.get("/student/profile");
        const studentProfile = profileResponse.data?.student || profileResponse.data;
        setProfile(studentProfile);

        const recommendationResponse = await api.post("/student/recommend-career", {
          skills: studentProfile?.skills || [],
          interests: studentProfile?.interests || []
        });
        setRecommendation(recommendationResponse.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load student dashboard");
      }
    }

    loadProfile();
  }, [user]);

  return (
    <Layout title="Student Dashboard">
      {error ? <p className="mb-4 rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p> : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold">Profile</h2>
          <div className="mt-4 space-y-2 text-slate-300">
            <p><span className="text-white">Name:</span> {profile?.name}</p>
            <p><span className="text-white">Email:</span> {profile?.email}</p>
            <p><span className="text-white">Career Goal:</span> {profile?.careerGoal || "Not set"}</p>
            <p><span className="text-white">Career Path:</span> {profile?.careerPath || "Not set"}</p>
            <p><span className="text-white">Skill Gap:</span> {(profile?.skillGap || []).join(", ") || "No gaps recorded"}</p>
            <p><span className="text-white">Mentor Feedback:</span> {profile?.mentorFeedback || "No feedback yet"}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold">Skills & Interests</h2>
          <p className="mt-4 text-slate-300"><span className="text-white">Skills:</span> {(profile?.skills || []).join(", ") || "None"}</p>
          <p className="mt-2 text-slate-300"><span className="text-white">Interests:</span> {(profile?.interests || []).join(", ") || "None"}</p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold">Recommended Careers</h2>
          <div className="mt-4 space-y-3">
            {(recommendation?.recommendations || []).map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                <p className="font-medium text-sky-300">{item.title}</p>
                <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                <p className="mt-2 text-xs text-slate-500">Match Score: {item.matchScore}%</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold">Feedback</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
              <p className="text-sm text-slate-300">{profile?.mentorFeedback || "No feedback yet."}</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default StudentDashboard;
