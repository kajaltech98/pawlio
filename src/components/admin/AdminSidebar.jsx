import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  PawPrint,
  LayoutDashboard,
  Users,
  CalendarCheck,
  Briefcase,
  ArrowLeft,
  UserRound,
  LogOut,
  X,
  Shield,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
    } catch (err) {
      console.error("Admin logout error:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const navItems = [
    { label: "Overview", path: "/admin", icon: LayoutDashboard },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Pets", path: "/admin/pets", icon: PawPrint },
    { label: "Appointments", path: "/admin/appointments", icon: CalendarCheck },
    { label: "Services", path: "/admin/services", icon: Briefcase },
  ];

  const currentPath = location.pathname;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        {/* Brand header */}
        <div className="admin-sidebar-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link to="/admin" className="admin-brand" onClick={onClose}>
              <div className="admin-brand-icon">
                <Shield size={20} />
              </div>
              <div className="admin-brand-text">
                <span className="admin-brand-title">PAWLIO</span>
                <span className="admin-badge">Admin Portal</span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={onClose}
              style={{ color: "#9bb8ab" }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="admin-nav">
          <div className="admin-nav-section-title">Administration</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/admin"
                ? currentPath === "/admin"
                : currentPath.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-link ${isActive ? "active" : ""}`}
                onClick={onClose}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="admin-sidebar-divider" />

          <div className="admin-nav-section-title">General</div>
          <Link
            to="/dashboard"
            className="admin-nav-link"
            onClick={onClose}
            title="Return to standard user dashboard"
          >
            <ArrowLeft size={19} />
            <span>Back to PAWLIO</span>
          </Link>

          <Link
            to="/profile"
            className="admin-nav-link"
            onClick={onClose}
          >
            <UserRound size={19} />
            <span>Profile</span>
          </Link>
        </nav>

        {/* Sidebar footer */}
        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={16} />
            <span>{loggingOut ? "Signing out..." : "Logout"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
