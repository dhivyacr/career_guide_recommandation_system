import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", skills: "", interests: "", careerGoal: "" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean),
        interests: form.interests.split(",").map((item) => item.trim()).filter(Boolean)
      };
      const response = await api.post("/auth/register", payload);
      login(response.data.token, response.data.role, response.data.user);
      navigate("/student/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <h1 className="text-3xl font-semibold">Student Registration</h1>
        <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder="Career Goal" value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value })} />
          <input className="md:col-span-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <input className="md:col-span-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder="Interests (comma separated)" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
          <button className="md:col-span-2 rounded-xl bg-sky-500 px-4 py-3 font-medium text-slate-950 hover:bg-sky-400" type="submit">
            Register
          </button>
        </form>
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      </div>
    </div>
  );
}

export default RegisterPage;
