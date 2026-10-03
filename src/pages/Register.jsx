import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  if (lower.includes("user already registered") || lower.includes("already registered")) {
    return "An account with this email address already exists. Please sign in instead.";
  }
  if (lower.includes("password should be at least")) {
    return "Password must be at least 6 characters long.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many attempts. Please wait a few minutes before trying again.";
  }
  if (lower.includes("network") || lower.includes("failed to fetch")) {
    return "Unable to connect. Please check your internet connection.";
  }
  return msg || "Something went wrong. Please try again.";
}

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: phone.trim() || null,
          },
        },
      });

      if (signUpError) {
        setError(formatAuthError(signUpError));
        return;
      }

      // Check if user already exists
      if (data?.user?.identities && data.user.identities.length === 0) {
        setError("An account with this email address already exists. Please sign in instead.");
        return;
      }

      if (data?.user) {
        try {
          // Ensure profile row exists
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: name.trim(),
            phone: phone.trim() || null,
            updated_at: new Date().toISOString(),
          });
        } catch (profileErr) {
          console.warn("Profile record creation warning:", profileErr);
        }
      }

      if (data?.session) {
        navigate("/dashboard", { replace: true });
      } else {
        setSuccess(
          "Account created successfully! Please check your email to verify your account or proceed to sign in."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* LEFT PANEL */}

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
            JOIN PAWLIO
          </span>

          <h1>
            Care for them.
            <span> Better.</span>
          </h1>

          <p>
            Create your PAWLIO account and keep your
            pet's health, appointments, and everyday
            care organized in one place.
          </p>

        </div>

        <div className="auth-image">
          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=85"
            alt="Pets"
          />
        </div>

      </div>


      {/* REGISTER PANEL */}

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
              CREATE ACCOUNT
            </span>

            <h2>
              Start your pet's care journey.
            </h2>

            <p>
              Create your account to start managing your pet's care journey.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            {/* NAME */}
            <div className="form-group">
              <label htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label htmlFor="register-email">
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PHONE */}
            <div className="form-group">
              <label htmlFor="register-phone">
                Phone number (optional)
              </label>
              <input
                id="register-phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="password-input">

                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
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


            {/* CONFIRM PASSWORD */}

            <div className="form-group">

              <label htmlFor="confirm-password">
                Confirm password
              </label>

              <div className="password-input">

                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm(!showConfirm)
                  }
                >
                  {showConfirm ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>


            {/* ERROR */}

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


            {/* SUCCESS */}

            {success && (
              <div
                style={{
                  color: "#287653",
                  background: "#effaf4",
                  border: "1px solid #c8ead7",
                  padding: "11px 13px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >
                {success}
              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}

              {!loading && <ArrowRight size={18} />}
            </button>

          </form>


          {/* LOGIN */}

          <div className="auth-register">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
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

export default Register;