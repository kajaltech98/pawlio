import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  PawPrint,
  Home,
  CalendarCheck,
  Heart,
  ShieldCheck,
  Bell,
  UserRound,
  Settings as SettingsIcon,
  LogOut,
  X,
  Menu,
  Shield,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { checkUserIsAdmin } from "../../lib/adminService";

export default function DashboardSidebar({ activeItem = "dashboard", onMobileClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (user) {
      checkUserIsAdmin(user).then((res) => {
        if (mounted) setIsAdmin(res);
      });
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const closeDrawer = () => {
    setMobileOpen(false);
    if (onMobileClose) onMobileClose();
  };

  const isCurrent = (path, name) => {
    const current = location.pathname.toLowerCase();
    if (current === path.toLowerCase()) return true;
    if (activeItem === name) return true;
    return false;
  };

  return (
    <>
      {/* MOBILE TOPBAR (Visible only on <= 768px screens) */}
      <div className="dashboard-mobile-topbar">
        <Link to="/dashboard" className="mobile-brand" onClick={closeDrawer}>
          <div className="mobile-brand-icon">
            <PawPrint size={18} />
          </div>
          <span>PAWLIO</span>
        </Link>

        <div className="mobile-topbar-actions">
          <Link
            to="/notifications"
            className="mobile-notif-btn"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="mobile-notif-dot" />}
          </Link>

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileOpen && (
        <div
          className="dashboard-mobile-overlay"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR DRAWER / DESKTOP SIDEBAR */}
      <aside className={`dashboard-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="dashboard-logo">
          <Link to="/dashboard" className="logo" onClick={closeDrawer} style={{ textDecoration: "none" }}>
            <span className="logo-icon">
              <PawPrint size={21} />
            </span>
            <span>PAWLIO</span>
          </Link>

          {/* Close button inside mobile drawer */}
          <button
            type="button"
            className="dashboard-drawer-close"
            onClick={closeDrawer}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION ITEMS (Section 28) */}
        <nav className="dashboard-nav">
          <div className="nav-group-label">MAIN</div>

          {/* 1. Dashboard */}
          <Link
            to="/dashboard"
            className={`dashboard-nav-item ${isCurrent("/dashboard", "dashboard") ? "active" : ""}`}
            onClick={closeDrawer}
          >
            <Home size={18} />
            <span>Dashboard</span>
          </Link>

          {/* 2. My Pets */}
          <Link
            to="/pets"
            className={`dashboard-nav-item ${isCurrent("/pets", "pets-section") ? "active" : ""}`}
            onClick={closeDrawer}
          >
            <PawPrint size={18} />
            <span>My Pets</span>
          </Link>

          {/* 3. Appointments */}
          <Link
            to="/appointments"
            className={`dashboard-nav-item ${isCurrent("/appointments", "appointments") ? "active" : ""}`}
            onClick={closeDrawer}
          >
            <CalendarCheck size={18} />
            <span>Appointments</span>
          </Link>

          <div className="nav-group-label" style={{ marginTop: 14 }}>HEALTH</div>

          {/* 4. Health Records */}
          <Link
            to="/health-records"
            className={`dashboard-nav-item ${isCurrent("/health-records", "health-records") ? "active" : ""}`}
            onClick={closeDrawer}
          >
            <Heart size={18} />
            <span>Health Records</span>
          </Link>

          {/* 5. Vaccinations */}
          <Link
            to="/vaccinations"
            className={`dashboard-nav-item ${isCurrent("/vaccinations", "vaccinations") ? "active" : ""}`}
            onClick={closeDrawer}
          >
            <ShieldCheck size={18} />
            <span>Vaccinations</span>
          </Link>

          {/* 6. Reminders */}
          <Link
            to="/dashboard#reminders"
            className={`dashboard-nav-item ${isCurrent("/dashboard#reminders", "reminders") ? "active" : ""}`}
            onClick={(e) => {
              closeDrawer();
              const el = document.getElementById("reminders");
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <Bell size={18} />
            <span>Reminders</span>
          </Link>

          <div className="nav-group-label" style={{ marginTop: 14 }}>ACCOUNT</div>

          {/* 7. Notifications */}
          <Link
            to="/notifications"
            className={`dashboard-nav-item ${isCurrent("/notifications", "notifications") ? "active" : ""}`}
            onClick={closeDrawer}
          >
            <div style={{ position: "relative", display: "inline-flex" }}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -3,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#D99A5B",
                  }}
                />
              )}
            </div>
            <span style={{ flex: 1 }}>Notifications</span>
            {unreadCount > 0 && (
              <span className="notif-badge-pill">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* 8. Profile */}
          <Link
            to="/profile"
            className={`dashboard-nav-item ${isCurrent("/profile", "profile") ? "active" : ""}`}
            onClick={closeDrawer}
          >
            <UserRound size={18} />
            <span>Profile</span>
          </Link>

          {/* 9. Settings */}
          <Link
            to="/settings"
            className={`dashboard-nav-item ${isCurrent("/settings", "settings") ? "active" : ""}`}
            onClick={closeDrawer}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </Link>

          {/* Admin Portal (if admin) */}
          {isAdmin && (
            <Link
              to="/admin"
              className="dashboard-nav-item admin-link"
              onClick={closeDrawer}
            >
              <Shield size={18} />
              <span>Admin Portal</span>
            </Link>
          )}
        </nav>

        {/* SIDEBAR FOOTER: USER MINI-PROFILE & LOGOUT (Section 28) */}
        <div className="dashboard-sidebar-bottom">
          <div
            className="sidebar-user-card"
            title={user?.email ? `${user?.user_metadata?.full_name || "Pet Parent"} (${user.email})` : "User Profile"}
          >
            <div className="sidebar-user-avatar">
              {user?.user_metadata?.full_name
                ? user.user_metadata.full_name[0].toUpperCase()
                : user?.email
                ? user.email[0].toUpperCase()
                : "P"}
            </div>
            <div className="sidebar-user-info">
              <strong title={user?.user_metadata?.full_name || user?.email || "Pet Parent"}>
                {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Pet Parent"}
              </strong>
              <span title={user?.email || "parent@pawlio.com"}>
                {user?.email || "parent@pawlio.com"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="dashboard-logout"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out of your account"
          >
            <LogOut size={16} />
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
