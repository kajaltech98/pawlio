import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  PawPrint,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function formatAuthError(err) {
  if (!err) return "Something went wrong. Please try again.";
  const msg = typeof err === "string" ? err : err.message || "";
  const lower = msg.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Invalid email or password. Please verify your credentials and try again.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm your email address before logging in.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many attempts. Please wait a few minutes before trying again.";
  }
  if (lower.includes("user already registered") || lower.includes("already registered")) {
    return "An account with this email already exists. Please log in instead.";
  }
  if (lower.includes("network") || lower.includes("failed to fetch")) {
    return "Unable to connect. Please check your internet connection.";
  }
  return msg || "Something went wrong. Please try again.";
}

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleForgotPassword = async () => {
    setError("");
    setResetMessage("");
    if (!email.trim()) {
      setError("Please enter your email address above to receive a password reset link.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setResetLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        setError(formatAuthError(error));
      } else {
        setResetMessage("Password reset email sent! Check your inbox.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to send reset email. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(formatAuthError(signInError));
        return;
      }

      if (signInData?.session) {
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-visual">

        <div className="auth-brand">
          <Link to="/" className="logo auth-logo">
            <span className="logo-icon">
              <PawPrint size={21} />
            </span>

            <span>PAWLIO</span>
          </Link>
        </div>

        <div className="auth-visual-content">

          <span className="section-label light">
            WELCOME BACK
          </span>

          <h1>
            Better care starts
            <span> here.</span>
          </h1>

          <p>
            Manage your pet's health, appointments,
            services, and everyday care from one place.
          </p>

        </div>

        <div className="auth-image">
          <img
            src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1000&q=85"
            alt="Happy dog"
          />
        </div>

      </div>


      <div className="auth-form-wrapper">

        <div className="auth-form-container">

          <div className="mobile-auth-logo">
            <Link to="/" className="logo">
              <span className="logo-icon">
                <PawPrint size={20} />
              </span>

              <span>PAWLIO</span>
            </Link>
          </div>

          <div className="auth-heading">

            <span className="section-label">
              ACCOUNT LOGIN
            </span>

            <h2>
              Welcome back.
            </h2>

            <p>
              Sign in to continue managing your
              pet's care journey.
            </p>

          </div>


          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

            </div>


            <div className="form-group">

              <div className="password-label">

                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "var(--primary)",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                >
                  {resetLoading ? "Sending link..." : "Forgot password?"}
                </button>

              </div>

              <div className="password-input">

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>


            <div className="remember-row">

              <label>
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

            </div>


            {error && (
              <div
                style={{
                  color: "#c94f3d",
                  background: "#fff1ee",
                  border: "1px solid #f2c8c0",
                  padding: "11px 13px",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}

            {resetMessage && (
              <div
                style={{
                  color: "#216044",
                  background: "#edf8f2",
                  border: "1px solid #cde8d8",
                  padding: "11px 13px",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                {resetMessage}
              </div>
            )}


            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}

              {!loading && <ArrowRight size={18} />}
            </button>


            <div className="auth-divider">
              <span>or continue with</span>
            </div>


            <button
              type="button"
              className="social-login"
              onClick={() =>
                alert("Google login can be connected later.")
              }
            >
              <span className="google-icon">
                G
              </span>

              Continue with Google
            </button>

          </form>


          <div className="auth-register">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
            </Link>

          </div>


          <div className="auth-security">

            <ShieldCheck size={16} />

            <span>
              Your information is handled securely.
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;