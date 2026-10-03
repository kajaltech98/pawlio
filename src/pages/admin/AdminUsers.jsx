import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAdminUsers, updateUserRole } from "../../lib/adminService";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'user' | 'admin'
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Unable to load user records. Please verify database connectivity.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (targetUser, newRole) => {
    try {
      setUpdatingUserId(targetUser.id);
      await updateUserRole(targetUser.id, newRole);

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
      showToast(`Role updated for ${targetUser.full_name || "User"} to ${newRole.toUpperCase()}.`);
    } catch (err) {
      console.error("Failed to update role:", err);
      showToast("Failed to update role. Please try again.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    // 1. Role filter
    if (roleFilter !== "all") {
      const currentRole = (u.role || "user").toLowerCase();
      if (currentRole !== roleFilter) return false;
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const nameMatch = (u.full_name || "").toLowerCase().includes(query);
      const phoneMatch = (u.phone || "").toLowerCase().includes(query);
      const emailMatch = (u.email || "").toLowerCase().includes(query);
      return nameMatch || phoneMatch || emailMatch;
    }

    return true;
  });

  return (
    <AdminLayout title="User Management">
      {/* Toast */}
      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header Bar */}
      <div className="admin-page-bar">
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0 }}>
            Registered Pet Parents & Accounts
          </h2>
          <p className="admin-subtitle">
            Manage system users, review roles, and monitor account registrations.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-secondary"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? "animate-spin-slow" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Controls: Search and Role Filter */}
      <div className="admin-controls-bar">
        <div className="admin-search-wrapper">
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by name, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-filter-group">
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--admin-text-muted)" }}>
            Filter Role:
          </span>
          <button
            type="button"
            className={`admin-filter-btn ${roleFilter === "all" ? "active" : ""}`}
            onClick={() => setRoleFilter("all")}
          >
            All ({users.length})
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${roleFilter === "user" ? "active" : ""}`}
            onClick={() => setRoleFilter("user")}
          >
            Users ({users.filter((u) => (u.role || "user") !== "admin").length})
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${roleFilter === "admin" ? "active" : ""}`}
            onClick={() => setRoleFilter("admin")}
          >
            Admins ({users.filter((u) => u.role === "admin").length})
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        {loading ? (
          <div className="admin-loading-container">
            <div className="admin-spinner" />
            <p style={{ fontWeight: 600 }}>Loading users...</p>
          </div>
        ) : error ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon" style={{ color: "#dc2626", background: "#fee2e2" }}>
              <AlertCircle size={28} />
            </div>
            <h3 className="admin-empty-title">Error Loading Users</h3>
            <p className="admin-empty-desc">{error}</p>
            <button
              type="button"
              className="admin-btn-primary"
              style={{ marginTop: 14 }}
              onClick={loadUsers}
            >
              Retry
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <Users size={28} />
            </div>
            <h3 className="admin-empty-title">No Users Found</h3>
            <p className="admin-empty-desc">
              {searchQuery
                ? "No registered users match your search query."
                : "No accounts have been registered yet."}
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Contact Info</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isAdmin = (u.role || "user").toLowerCase() === "admin";
                  const isUpdating = updatingUserId === u.id;

                  const displayName = u.full_name || "Pet Parent";
                  const initials = displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={u.id}>
                      {/* Name & Avatar */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              background: isAdmin ? "#e0e7ff" : "#e6f4ed",
                              color: isAdmin ? "#4338ca" : "#1e704a",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--admin-text-main)" }}>
                              {displayName}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--admin-text-muted)",
                                fontFamily: "monospace",
                              }}
                            >
                              ID: {u.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td>
                        <div style={{ fontSize: "0.88rem" }}>
                          {u.phone ? u.phone : <span style={{ color: "#94a3b8" }}>No phone</span>}
                        </div>
                        {u.email && (
                          <div style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)" }}>
                            {u.email}
                          </div>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td>
                        <span className={`admin-pill ${isAdmin ? "admin" : "user"}`}>
                          {isAdmin ? (
                            <>
                              <Shield size={12} />
                              Admin
                            </>
                          ) : (
                            <>
                              <UserCheck size={12} />
                              User
                            </>
                          )}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td style={{ color: "var(--admin-text-muted)", fontSize: "0.85rem" }}>
                        {formatDate(u.created_at)}
                      </td>

                      {/* Role Toggle Action */}
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className={isAdmin ? "admin-btn-secondary" : "admin-btn-secondary"}
                          onClick={() => handleRoleChange(u, isAdmin ? "user" : "admin")}
                          disabled={isUpdating}
                          style={{
                            fontSize: "0.78rem",
                            padding: "5px 12px",
                            cursor: isUpdating ? "not-allowed" : "pointer",
                          }}
                          title={isAdmin ? "Demote to standard user" : "Promote to administrator"}
                        >
                          {isUpdating
                            ? "Updating..."
                            : isAdmin
                            ? "Revoke Admin"
                            : "Make Admin"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
