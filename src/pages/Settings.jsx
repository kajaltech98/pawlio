import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Shield,
  LogOut,
  Pencil,
  Check,
  Lock,
} from "lucide-react";
import DashboardSidebar from "../components/layout/DashboardSidebar";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { supabase } from "../lib/supabase";
import "../components/settings/settings.css";

export default function Settings() {
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth();
  const { inAppNotifEnabled, setInAppNotifEnabled } = useNotifications();

  const [user, setUser] = useState(authUser || null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [prefSavedMessage, setPrefSavedMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchSettings = async () => {
      try {
        let currentUser = authUser;
        if (!currentUser) {
          const { data: { user: fetchedUser } = {}, error: userError } =
            await supabase.auth.getUser();

          if (userError || !fetchedUser) {
            if (!ignore) navigate("/login", { replace: true });
            return;
          }
          currentUser = fetchedUser;
        }

        if (ignore) return;
        setUser(currentUser);

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (!ignore && !error && data) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Settings load error:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      ignore = true;
    };
  }, [authUser, navigate]);

  const handleToggleInApp = (e) => {
    const nextVal = e.target.checked;
    setInAppNotifEnabled(nextVal);
    setPrefSavedMessage("Notification preference saved.");
    setTimeout(() => setPrefSavedMessage(""), 3000);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="profile-loading" style={{ minHeight: "100vh" }}>
        <div className="profile-loading-card">
          <div className="profile-spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  const fullName = profile?.full_name || user?.user_metadata?.full_name || "Pet Parent";
  const phone = profile?.phone || user?.phone || "Not provided";
  const email = user?.email || "Not available";

  return (
    <div className="settings-page-layout">
      {/* SIDEBAR */}
      <DashboardSidebar activeItem="settings" />

      {/* MAIN CONTENT */}
      <main className="settings-main-content">
        <header className="settings-header">
          <span className="section-label">PREFERENCES & ACCOUNT</span>
          <h1>Settings</h1>
          <p>Manage your account preferences, notification alerts, and security.</p>
        </header>

        {prefSavedMessage && (
          <div className="profile-success-message" style={{ marginBottom: 20 }}>
            <Check size={16} />
            {prefSavedMessage}
          </div>
        )}

        <div className="settings-sections">
          {/* SECTION 1: ACCOUNT */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <User size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h2>Account Information</h2>
              </div>
              <Link
                to="/profile"
                className="btn-secondary"
                style={{
                  height: 34,
                  fontSize: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Pencil size={13} />
                Edit Profile
              </Link>
            </div>

            <div className="settings-account-grid">
              <div className="settings-info-item">
                <span>Full Name</span>
                <strong>{fullName}</strong>
              </div>

              <div className="settings-info-item">
                <span>Email</span>
                <strong>{email}</strong>
              </div>

              <div className="settings-info-item">
                <span>Phone</span>
                <strong>{phone}</strong>
              </div>
            </div>
          </section>

          {/* SECTION 2: NOTIFICATIONS */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <Bell size={20} />
              </div>
              <div>
                <h2>Notification Preferences</h2>
              </div>
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <h3>Show in-app notifications</h3>
                <p>
                  Receive real-time alerts for appointment confirmations, upcoming checkups, and vaccination due dates.
                </p>
              </div>

              <label className="pawlio-switch" aria-label="Toggle in-app notifications">
                <input
                  type="checkbox"
                  checked={inAppNotifEnabled}
                  onChange={handleToggleInApp}
                />
                <span className="pawlio-slider"></span>
              </label>
            </div>
          </section>

          {/* SECTION 3: SECURITY */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <Shield size={20} />
              </div>
              <div>
                <h2>Security & Session</h2>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text)", lineHeight: 1.5 }}>
                Your PAWLIO account is authenticated securely via Supabase. You can sign out of your current session across this browser at any time.
              </p>

              <div>
                <button
                  type="button"
                  className="btn-logout-settings"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut size={16} />
                  <span>{loggingOut ? "Signing out..." : "Logout"}</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
