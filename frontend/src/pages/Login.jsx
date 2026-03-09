import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginUser } from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("student");
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function parseGoogleName(credential = "") {
    try {
      const payload = credential.split(".")[1];
      if (!payload) {
        return "Google Student";
      }
      const parsed = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
      return parsed.name || "Google Student";
    } catch {
      return "Google Student";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await loginUser(form);
      const token = response.data?.token;
      const user = response.data?.user;

      if (!token || !user?.role) {
        setMessage("Invalid login response from server.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userName", user.name || "");

      if (user.role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
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
          <button type="button">Support</button>
          <button type="button">Help Center</button>
        </div>
      </header>

      <section className="login-center login-wrapper">
        <div className="login-intro">
          <h1 className="login-title">Welcome Back</h1>
          <p>Please enter your credentials to access your career guidance dashboard.</p>
        </div>

        <div className="login-modern-card login-card">
          <div className="login-tabs">
            <button
              type="button"
              onClick={() => setMode("student")}
              className={mode === "student" ? "active" : ""}
            >
              Student Login
            </button>
            <button type="button" onClick={() => setMode("admin")} className={mode === "admin" ? "active" : ""}>
              Admin Login
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field-wrap" htmlFor="email">
              <span className="field-icon" aria-hidden="true">
                @
              </span>
              <input
                id="email"
                type="email"
                placeholder="Email Address"
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

          {mode === "student" ? (
            <>
              <div className="login-divider">
                <span>OR</span>
              </div>
              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    console.log("Google login success");
                    console.log("Google login success:", credentialResponse);
                    const credential = credentialResponse?.credential || "";

                    localStorage.setItem("google_token", credential);
                    localStorage.setItem("token", credential);
                    localStorage.setItem("role", "student");
                    localStorage.setItem("userName", parseGoogleName(credential));

                    navigate("/profile", { replace: true });
                  }}
                  onError={() => {
                    console.log("Google login failed");
                  }}
                />
              </div>
            </>
          ) : null}

          <div className="security-info">
            <span>256-bit SSL Encryption</span>
            <span>Secure Data Storage</span>
          </div>

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

