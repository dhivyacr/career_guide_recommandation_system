import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileCard from "../components/ProfileCard";
import { getStudentProfile, saveStudentProfile } from "../services/studentService";

const SKILL_SUGGESTIONS = {
  MECH: ["AutoCAD", "SolidWorks", "MATLAB"],
  CSE: ["React", "Node.js", "MongoDB"],
  AIML: ["Python", "TensorFlow", "Machine Learning"]
};

function StudentProfile() {
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem("studentProfile") || "{}");
  const storedPortfolio = JSON.parse(localStorage.getItem("studentPortfolio") || "{}");
  const [profile, setProfile] = useState({
    name: stored.name || "",
    regNo: stored.regNo || stored.registerNumber || "",
    educationLevel: stored.educationLevel || stored.education || "",
    degree: stored.degree || stored.department || "",
    gpa: stored.gpa || stored.cgpa || "",
    dob: stored.dob || "",
    graduation: stored.graduation || "",
    skills: Array.isArray(stored.skills) ? stored.skills : [],
    careerGoal: stored.careerGoal || "",
    mentorName: stored.mentorName || "",
    githubLink: stored.githubLink || "",
    linkedInLink: stored.linkedInLink || ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const response = await getStudentProfile();
        const student = response.data?.student;

        if (!mounted || !student) {
          return;
        }

        const nextProfile = {
          name: student.name || "",
          regNo: student.regNo || student.registerNumber || "",
          educationLevel: student.educationLevel || student.education || "",
          degree: student.degree || student.department || "",
          gpa: student.gpa || student.cgpa || "",
          dob: student.dob || "",
          graduation: student.graduation || "",
          skills: Array.isArray(student.technicalSkills || student.skills)
            ? student.technicalSkills || student.skills
            : [],
          careerGoal: student.careerGoal || "",
          mentorName: student.mentorName || "",
          githubLink: student.githubLink || "",
          linkedInLink: student.linkedInLink || ""
        };

        setProfile(nextProfile);
        localStorage.setItem("studentProfile", JSON.stringify(nextProfile));
      } catch (_error) {
        // Keep local fallback if fetch fails.
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  function handleChange(event) {
    setError("");
    setProfile((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  const birthdayMessage = useMemo(() => {
    if (!profile.dob || !profile.name) {
      return "";
    }

    const today = new Date();
    const birthday = new Date(profile.dob);

    if (today.getDate() === birthday.getDate() && today.getMonth() === birthday.getMonth()) {
      return `Happy Birthday ${profile.name}!`;
    }

    return "";
  }, [profile.dob, profile.name]);

  const suggestedSkills = useMemo(() => {
    const normalizedDepartment = String(profile.degree || "").trim().toUpperCase();

    if (normalizedDepartment.includes("MECH")) {
      return SKILL_SUGGESTIONS.MECH;
    }
    if (normalizedDepartment.includes("CSE") || normalizedDepartment.includes("COMPUTER")) {
      return SKILL_SUGGESTIONS.CSE;
    }
    if (
      normalizedDepartment.includes("AIML") ||
      normalizedDepartment.includes("AI") ||
      normalizedDepartment.includes("ML")
    ) {
      return SKILL_SUGGESTIONS.AIML;
    }

    return [];
  }, [profile.degree]);

  const readinessScore = useMemo(() => {
    const projectsCount = Array.isArray(storedPortfolio.projects) ? storedPortfolio.projects.length : 0;
    const certificatesCount = Array.isArray(storedPortfolio.certificates) ? storedPortfolio.certificates.length : 0;
    const resumeUploaded = Boolean(storedPortfolio.resume?.name);
    const score = Math.min(
      100,
      profile.skills.length * 10 + projectsCount * 15 + certificatesCount * 10 + (resumeUploaded ? 15 : 0)
    );

    return {
      score,
      projectsCount,
      certificatesCount,
      resumeUploaded
    };
  }, [profile.skills.length, storedPortfolio]);

  const profileCompletion = useMemo(() => {
    const completed = [
      Boolean(profile.name.trim()),
      Boolean(profile.regNo.trim()),
      profile.skills.length > 0,
      Boolean(profile.githubLink.trim()),
      Boolean(storedPortfolio.resume?.name)
    ].filter(Boolean).length;

    return Math.round((completed / 5) * 100);
  }, [profile.name, profile.regNo, profile.skills.length, profile.githubLink, storedPortfolio]);

  function addSkill() {
    const nextSkill = skillInput.trim();

    if (!nextSkill) {
      return;
    }

    if (profile.skills.some((skill) => skill.toLowerCase() === nextSkill.toLowerCase())) {
      setSkillInput("");
      return;
    }

    setProfile((current) => ({
      ...current,
      skills: [...current.skills, nextSkill]
    }));
    setSkillInput("");
    setError("");
  }

  function addSuggestedSkill(skill) {
    setProfile((current) => {
      if (current.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
        return current;
      }

      return {
        ...current,
        skills: [...current.skills, skill]
      };
    });
  }

  function removeSkill(skillToRemove) {
    setProfile((current) => ({
      ...current,
      skills: current.skills.filter((skill) => skill !== skillToRemove)
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!profile.name.trim() || !profile.regNo.trim() || profile.skills.length === 0) {
      setError("Name, Register Number, and at least one Skill are required.");
      return;
    }

    try {
      const payload = {
        ...profile,
        email: stored.email || "",
        registerNumber: profile.regNo,
        department: profile.degree,
        cgpa: profile.gpa,
        education: profile.educationLevel,
        technicalSkills: profile.skills,
        skills: profile.skills
      };

      await saveStudentProfile(payload);
      localStorage.setItem("studentProfile", JSON.stringify({ ...profile }));
      setError("");
      alert("Profile saved successfully");
      navigate("/career");
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Failed to save profile");
    }
  }

  return (
    <div className="space-y-6 text-[#e5e7eb]">
      {birthdayMessage ? (
        <section className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-5 py-4 shadow-[0_0_24px_rgba(251,191,36,0.12)]">
          <p className="text-lg font-semibold text-amber-100">{birthdayMessage}</p>
          <p className="mt-1 text-sm text-amber-50/90">Wishing you success in your career journey.</p>
        </section>
      ) : null}

      <section>
        <h1 className="text-3xl font-bold text-white">Complete Your Profile</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#b4c3d9]">
          Our AI needs to know you better to recommend the most accurate career paths and learning resources.
        </p>
        {loading ? <p className="mt-3 text-sm text-[#8da7c9]">Loading your profile...</p> : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_30px_rgba(59,130,246,0.14)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Career Readiness Score</h2>
              <p className="mt-1 text-sm text-[#8da7c9]">Based on skills, projects, certificates, and resume status.</p>
            </div>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              {readinessScore.score}%
            </span>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#0b1f36]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
              style={{ width: `${readinessScore.score}%` }}
            />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white">
              Skills added: {profile.skills.length}
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white">
              Projects added: {readinessScore.projectsCount}
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white">
              Certificates added: {readinessScore.certificatesCount}
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white">
              Resume uploaded: {readinessScore.resumeUploaded ? "Yes" : "No"}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_30px_rgba(59,130,246,0.14)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Profile Completion</h2>
              <p className="mt-1 text-sm text-[#8da7c9]">Tracks the key profile items needed for recommendations.</p>
            </div>
            <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100">
              {profileCompletion}%
            </span>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#0b1f36]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          <div className="mt-5 space-y-3 text-sm text-[#dbeafe]">
            <div className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3">Name: {profile.name ? "Complete" : "Missing"}</div>
            <div className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3">Register Number: {profile.regNo ? "Complete" : "Missing"}</div>
            <div className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3">Skills: {profile.skills.length ? "Complete" : "Missing"}</div>
            <div className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3">GitHub: {profile.githubLink ? "Complete" : "Missing"}</div>
            <div className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3">Resume: {storedPortfolio.resume?.name ? "Complete" : "Missing"}</div>
          </div>
        </section>
      </div>

      <ProfileCard variant="welcome" />

      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_30px_rgba(59,130,246,0.14)]">
          <h2 className="text-lg font-semibold text-white">Personal Information</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              name="name"
              placeholder="Full Name *"
              value={profile.name}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
            <input
              name="regNo"
              placeholder="Ex: 22AIML045 *"
              value={profile.regNo}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-[#8da7c9]">Mentor Name</label>
            <input
              name="mentorName"
              placeholder="Enter your mentor name"
              value={profile.mentorName}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_30px_rgba(59,130,246,0.14)]">
          <h2 className="text-lg font-semibold text-white">Academic Background</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <select
              name="educationLevel"
              value={profile.educationLevel}
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
              placeholder="Department"
              value={profile.degree}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
            <input
              name="gpa"
              placeholder="Academic Performance (CGPA)"
              value={profile.gpa}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
            <input
              type="date"
              name="dob"
              value={profile.dob}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none focus:border-blue-400/60"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_30px_rgba(59,130,246,0.14)]">
          <h2 className="text-lg font-semibold text-white">Professional Profiles</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              type="url"
              name="githubLink"
              placeholder="https://github.com/username"
              value={profile.githubLink}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
            <input
              type="url"
              name="linkedInLink"
              placeholder="https://linkedin.com/in/username"
              value={profile.linkedInLink}
              onChange={handleChange}
              className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_30px_rgba(59,130,246,0.14)]">
          <h2 className="text-lg font-semibold text-white">Skills</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills.length ? (
              profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-[#9fd1ff]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-[#dbeafe] transition hover:text-white"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <p className="text-sm text-[#8da7c9]">Add at least one skill to complete your profile.</p>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <input
              value={skillInput}
              onChange={(event) => setSkillInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Add a skill *"
              className="flex-1 rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
            />
            <button
              type="button"
              onClick={addSkill}
              className="rounded-xl border border-blue-400/40 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-[#9fd1ff] transition hover:bg-blue-500/20"
            >
              + Add Skill
            </button>
          </div>

          {suggestedSkills.length ? (
            <div className="mt-5">
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#8da7c9]">Suggested For Your Department</p>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSuggestedSkill(skill)}
                    className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-100 transition hover:bg-cyan-500/20"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_30px_rgba(59,130,246,0.14)]">
          <h2 className="text-lg font-semibold text-white">Career Direction</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
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
