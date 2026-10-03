import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";

export default function AdminHeader({ title = "Admin Overview", onMobileToggle }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
    } catch (err) {
      console.error("Admin header logout error:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Admin";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="admin-header">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="admin-header-left">
        <button
          type="button"
          className="admin-mobile-toggle"
          onClick={onMobileToggle}
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
        <h1 className="admin-page-title">{title}</h1>
      </div>

      {/* Right: Notifications, Profile, Logout */}
      <div className="admin-header-right">
        {/* Notification Icon */}
        <Link
          to="/notifications"
          className="admin-icon-btn"
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="admin-badge-dot" />}
        </Link>

        {/* Admin Profile */}
        <Link to="/profile" className="admin-profile-chip" title="Admin Profile">
          <div className="admin-avatar">{initials}</div>
          <div className="admin-profile-info">
            <span className="admin-profile-name">{displayName}</span>
            <span className="admin-profile-role">Admin</span>
          </div>
        </Link>

        {/* Logout */}
        <button
          type="button"
          className="admin-btn-secondary"
          onClick={handleLogout}
          disabled={loggingOut}
          title="Sign out of Admin Console"
        >
          <LogOut size={15} />
          <span>{loggingOut ? "Exiting..." : "Logout"}</span>
        </button>
      </div>
    </header>
  );
}
