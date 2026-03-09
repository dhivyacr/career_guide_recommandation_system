import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileCard from "../components/ProfileCard";
import { saveStudentProfile } from "../services/studentService";

function StudentProfile() {
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem("studentProfile") || "{}");
  const [profile, setProfile] = useState({
    name: stored.name || "",
    regNo: stored.regNo || "",
    education: stored.education || "",
    degree: stored.degree || "",
    gpa: stored.gpa || "",
    graduation: stored.graduation || "",
    skills: stored.skills || "",
    softSkills: stored.softSkills || "",
    interests: stored.interests || "",
    careerGoal: stored.careerGoal || ""
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...profile,
        technicalSkills: String(profile.skills || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        softSkills: String(profile.softSkills || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        interests: String(profile.interests || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      };

      await saveStudentProfile(payload);
      localStorage.setItem("studentProfile", JSON.stringify(profile));
      alert("Profile saved successfully");
      navigate("/career");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save profile");
    }
  };

  return (
    <div className="space-y-6 text-[#e5e7eb]">
      <section>
        <h1 className="text-3xl font-bold text-white">Complete Your Profile</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#b4c3d9]">
          Our AI needs to know you better to recommend the most accurate career paths and learning resources.
        </p>
      </section>

      <ProfileCard variant="welcome" />

      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_30px_rgba(59,130,246,0.14)]">
          <h2 className="text-lg font-semibold text-white">Personal Information</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              name="name"
              placeholder="Full Name"
              value={profile.name}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
            <input
              name="regNo"
              placeholder="Ex: 22AIML045"
              value={profile.regNo}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_30px_rgba(59,130,246,0.14)]">
          <h2 className="text-lg font-semibold text-white">Academic Background</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <select
              name="education"
              value={profile.education}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none focus:border-blue-400/60"
            >
              <option value="">Education Level</option>
              <option value="High School">High School</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Doctorate">Doctorate</option>
            </select>
            <input
              name="degree"
              placeholder="Degree Program"
              value={profile.degree}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
            <input
              name="gpa"
              placeholder="Academic Performance (GPA/%)"
              value={profile.gpa}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
            <input
              type="date"
              name="graduation"
              value={profile.graduation}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none focus:border-blue-400/60"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_30px_rgba(59,130,246,0.14)]">
          <h2 className="text-lg font-semibold text-white">Skills & Interests</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              name="skills"
              placeholder="Technical Skills"
              value={profile.skills}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
            <input
              name="softSkills"
              placeholder="Soft Skills"
              value={profile.softSkills}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
            <input
              name="interests"
              placeholder="Areas of Interest"
              value={profile.interests}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
            <input
              name="careerGoal"
              placeholder="Career Goal"
              value={profile.careerGoal}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
          </div>
        </section>

        <div className="flex justify-end">
          <button
            className="rounded-xl bg-[#3b82f6] px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(59,130,246,0.35)] transition hover:brightness-110"
            type="submit"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentProfile;
