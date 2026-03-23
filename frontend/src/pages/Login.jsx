import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const normalizedEmail = String(form.email || "").trim().toLowerCase();

    if (!normalizedEmail.endsWith("@bitsathy.ac.in")) {
      setMessage("Please use your BIT institutional email.");
      return;
    }

    try {
      const response = await loginUser({ ...form, email: normalizedEmail });
      const user = response.data?.user;
      const role = user?.role;
      const token = response.data?.token;

      if (!role || !token) {
        setMessage("Invalid login response from server.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userName", user?.email?.split("@")[0] || normalizedEmail.split("@")[0]);
      localStorage.setItem("userEmail", user?.email || normalizedEmail);
      localStorage.removeItem("studentProfile");

      if (role === "faculty") {
        navigate("/mentor-dashboard");
        return;
      }

      if (role === "admin") {
        navigate("/mentor-dashboard");
        return;
      }

      if (role === "mentor") {
        navigate("/mentor-dashboard");
        return;
      }

      if (role === "student") {
        navigate("/student-dashboard");
        return;
      }

      setMessage("Invalid login response from server.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="login-page">
      <div className="particles">
        <span style={{ left: "8%", bottom: "-8%", animationDelay: "0s", animationDuration: "16s" }} />
        <span style={{ left: "20%", bottom: "-12%", animationDelay: "1s", animationDuration: "14s" }} />
        <span style={{ left: "34%", bottom: "-10%", animationDelay: "2.4s", animationDuration: "18s" }} />
        <span style={{ left: "50%", bottom: "-15%", animationDelay: "0.8s", animationDuration: "17s" }} />
        <span style={{ left: "62%", bottom: "-9%", animationDelay: "3s", animationDuration: "13s" }} />
        <span style={{ left: "75%", bottom: "-13%", animationDelay: "1.8s", animationDuration: "15s" }} />
        <span style={{ left: "88%", bottom: "-11%", animationDelay: "2.8s", animationDuration: "16s" }} />
      </div>

      <header className="login-top-nav">
        <div className="logo-wrap">
          <span className="logo-mark" />
          <span className="logo-text">Intelligent Career Guidance</span>
        </div>
        <div className="login-top-links">
          <button type="button" onClick={handleBack}>
            Back
          </button>
          <button type="button">Support</button>
          <button type="button">Help Center</button>
        </div>
      </header>

      <section className="login-center login-wrapper">
        <div className="login-intro">
          <h1 className="login-title">Welcome Back</h1>
          <p>Please enter your BIT email to access the career guidance dashboard.</p>
        </div>

        <div className="login-modern-card login-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field-wrap" htmlFor="email">
              <span className="field-icon" aria-hidden="true">
                @
              </span>
              <input
                id="email"
                type="email"
                placeholder="Email Address (@bitsathy.ac.in)"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </label>

            <label className="field-wrap" htmlFor="password">
              <span className="field-icon" aria-hidden="true">
                *
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </label>

            <button className="signin-button" type="submit">
              Sign In to Account
            </button>
          </form>

          {message ? <p className="login-message">{message}</p> : null}
        </div>
      </section>

      <footer className="login-footer">
        <p>(c) 2026 Intelligent Career Guidance System</p>
        <div className="login-footer-links">
          <button type="button">Privacy Policy</button>
          <button type="button">Terms of Service</button>
          <button type="button">Cookies</button>
        </div>
      </footer>
    </div>
  );
}

export default Login;

