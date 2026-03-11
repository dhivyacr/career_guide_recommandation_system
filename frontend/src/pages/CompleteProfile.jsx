import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveStudentProfile } from "../services/studentService";

function CompleteProfile() {
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem("studentProfile") || "{}");
  const [form, setForm] = useState({
    name: stored.name || "",
    registerNumber: stored.registerNumber || stored.regNo || "",
    department: stored.degree || stored.department || "",
    year: stored.year || "",
    cgpa: stored.gpa || stored.cgpa || "",
    skills: Array.isArray(stored.skills) ? stored.skills.join(", ") : stored.skills || "",
    careerInterest: stored.careerGoal || ""
  });
  const [message, setMessage] = useState("");

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const payload = {
        name: form.name,
        email: stored.email || "",
        registerNumber: form.registerNumber,
        department: form.department,
        year: form.year,
        cgpa: form.cgpa,
        technicalSkills: String(form.skills || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        careerGoal: form.careerInterest
      };

      console.log("Saving complete profile payload:", payload);
      await saveStudentProfile(payload);

      localStorage.setItem(
        "studentProfile",
        JSON.stringify({
          ...stored,
          name: form.name,
          registerNumber: form.registerNumber,
          degree: form.department,
          department: form.department,
          year: form.year,
          gpa: form.cgpa,
          cgpa: form.cgpa,
          skills: payload.technicalSkills,
          careerGoal: form.careerInterest
        })
      );

      navigate("/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to complete profile.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 text-[#e5e7eb]">
      <section>
        <h1 className="text-3xl font-bold text-white">Complete Your Profile</h1>
        <p className="mt-2 text-sm leading-6 text-[#b4c3d9]">
          Complete your academic and career details before accessing the dashboard.
        </p>
      </section>

      <form
        className="space-y-6 rounded-2xl border border-white/5 bg-[#0f2747] p-6 shadow-[0_0_30px_rgba(59,130,246,0.14)]"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
          />
          <input
            name="registerNumber"
            placeholder="Register Number"
            value={form.registerNumber}
            onChange={handleChange}
            required
            className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
          />
          <input
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            required
            className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
          />
          <input
            name="year"
            placeholder="Year"
            value={form.year}
            onChange={handleChange}
            required
            className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
          />
          <input
            name="cgpa"
            placeholder="CGPA"
            value={form.cgpa}
            onChange={handleChange}
            required
            className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
          />
          <input
            name="skills"
            placeholder="Skills (comma separated)"
            value={form.skills}
            onChange={handleChange}
            required
            className="rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
          />
        </div>

        <input
          name="careerInterest"
          placeholder="Career Interest"
          value={form.careerInterest}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
        />

        {message ? <p className="text-sm text-red-300">{message}</p> : null}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-[#3b82f6] px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(59,130,246,0.35)] transition hover:brightness-110"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompleteProfile;
