import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await api.post("/auth/login", form);
      login(response.data.token, response.data.role, response.data.user);

      if (response.data.role === "admin") {
        navigate("/admin/dashboard");
      } else if (response.data.role === "mentor" || response.data.role === "faculty") {
        navigate("/mentor/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <h1 className="text-3xl font-semibold">Login</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to access your role-based dashboard.</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="w-full rounded-xl bg-sky-500 px-4 py-3 font-medium text-slate-950 hover:bg-sky-400" type="submit">
            Login
          </button>
        </form>
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        <p className="mt-6 text-sm text-slate-400">
          New student? <Link className="text-sky-400" to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
