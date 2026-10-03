import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  PawPrint,
  CalendarCheck,
  Briefcase,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAdminOverviewStats } from "../../lib/adminService";
import { formatAppointmentTime } from "../../lib/dateUtils";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminOverviewStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      setError("Unable to load overview statistics. Please try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const formatTime = (timeStr) => {
    return formatAppointmentTime(timeStr);
  };

  return (
    <AdminLayout title="Admin Overview">
      {/* Top Banner Bar */}
      <div className="admin-page-bar">
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0 }}>
            System Performance & Metrics
          </h2>
          <p className="admin-subtitle">
            Live overview of registered pet parents, pets, appointments, and care services.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-secondary"
          onClick={() => loadData(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={15}
            className={refreshing ? "animate-spin-slow" : ""}
          />
          <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="admin-loading-container">
          <div className="admin-spinner" />
          <p style={{ fontWeight: 600 }}>Loading dashboard...</p>
        </div>
      ) : error ? (
        <div
          className="admin-empty-state"
          style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e3ebe6" }}
        >
          <div className="admin-empty-icon" style={{ color: "#dc2626", background: "#fee2e2" }}>
            <AlertCircle size={28} />
          </div>
          <h3 className="admin-empty-title">Error Loading Overview</h3>
          <p className="admin-empty-desc">{error}</p>
          <button
            type="button"
            className="admin-btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => loadData()}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Key Stat Cards (Supabase Data) */}
          <div className="admin-stats-grid">
            {/* 1. Total Users */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-title">Total Users</span>
                <div className="admin-stat-icon green">
                  <Users size={20} />
                </div>
              </div>
              <div className="admin-stat-value">{stats?.totalUsers ?? 0}</div>
              <div className="admin-stat-desc">Registered accounts</div>
            </div>

            {/* 2. Total Pets */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-title">Total Pets</span>
                <div className="admin-stat-icon blue">
                  <PawPrint size={20} />
                </div>
              </div>
              <div className="admin-stat-value">{stats?.totalPets ?? 0}</div>
              <div className="admin-stat-desc">Pets registered</div>
            </div>

            {/* 3. Appointments */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-title">Appointments</span>
                <div className="admin-stat-icon amber">
                  <CalendarCheck size={20} />
                </div>
              </div>
              <div className="admin-stat-value">{stats?.totalAppointments ?? 0}</div>
              <div className="admin-stat-desc">Total bookings</div>
            </div>

            {/* 4. Active Services */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-title">Active Services</span>
                <div className="admin-stat-icon purple">
                  <Briefcase size={20} />
                </div>
              </div>
              <div className="admin-stat-value">{stats?.activeServices ?? 0}</div>
              <div className="admin-stat-desc">Available services</div>
            </div>
          </div>

          {/* Appointment Summary Box */}
          <div className="admin-summary-box">
            <div className="admin-summary-header">
              <h3 className="admin-summary-title">Appointment Summary</h3>
              <span style={{ fontSize: "0.82rem", color: "var(--admin-text-muted)", fontWeight: 600 }}>
                Total: {stats?.totalAppointments || 0}
              </span>
            </div>

            {/* Lightweight progress indicator bar */}
            {stats?.totalAppointments > 0 ? (
              <div
                style={{
                  height: 10,
                  width: "100%",
                  background: "#e2e8f0",
                  borderRadius: 6,
                  overflow: "hidden",
                  display: "flex",
                }}
              >
                <div
                  style={{
                    width: `${((stats.appointmentsScheduled || 0) / stats.totalAppointments) * 100}%`,
                    background: "#3b82f6",
                  }}
                  title={`Scheduled: ${stats.appointmentsScheduled}`}
                />
                <div
                  style={{
                    width: `${((stats.appointmentsCompleted || 0) / stats.totalAppointments) * 100}%`,
                    background: "#10b981",
                  }}
                  title={`Completed: ${stats.appointmentsCompleted}`}
                />
                <div
                  style={{
                    width: `${((stats.appointmentsCancelled || 0) / stats.totalAppointments) * 100}%`,
                    background: "#ef4444",
                  }}
                  title={`Cancelled: ${stats.appointmentsCancelled}`}
                />
              </div>
            ) : null}

            {/* Breakdown Cards */}
            <div className="admin-summary-items">
              <div className="admin-summary-item scheduled">
                <div>
                  <div className="admin-summary-label">Scheduled</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Upcoming & in progress</div>
                </div>
                <div className="admin-summary-count" style={{ color: "#2563eb" }}>
                  {stats?.appointmentsScheduled ?? 0}
                </div>
              </div>

              <div className="admin-summary-item completed">
                <div>
                  <div className="admin-summary-label">Completed</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Finished care sessions</div>
                </div>
                <div className="admin-summary-count" style={{ color: "#059669" }}>
                  {stats?.appointmentsCompleted ?? 0}
                </div>
              </div>

              <div className="admin-summary-item cancelled">
                <div>
                  <div className="admin-summary-label">Cancelled</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Cancelled bookings</div>
                </div>
                <div className="admin-summary-count" style={{ color: "#dc2626" }}>
                  {stats?.appointmentsCancelled ?? 0}
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Recent Users & Recent Appointments */}
          <div className="admin-two-cols">
            {/* Left: Recent Users */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Recent Users</h3>
                <Link to="/admin/users" className="admin-view-all-btn">
                  View All Users
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="admin-table-container">
                {stats?.recentUsers?.length > 0 ? (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Contact / Phone</th>
                        <th>Joined</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentUsers.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: "var(--admin-text-main)" }}>
                              {u.full_name || "Pet Parent"}
                            </div>
                          </td>
                          <td style={{ color: "var(--admin-text-muted)", fontSize: "0.85rem" }}>
                            {u.phone || "—"}
                          </td>
                          <td style={{ color: "var(--admin-text-muted)", fontSize: "0.85rem" }}>
                            {formatDate(u.created_at)}
                          </td>
                          <td>
                            <span className={`admin-pill ${u.role === "admin" ? "admin" : "user"}`}>
                              {u.role || "User"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="admin-empty-state" style={{ padding: "36px 16px" }}>
                    <p className="admin-empty-desc">No registered users found yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Recent Appointments */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Recent Appointments</h3>
                <Link to="/admin/appointments" className="admin-view-all-btn">
                  View All Appointments
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="admin-table-container">
                {stats?.recentAppointments?.length > 0 ? (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Pet & Owner</th>
                        <th>Service</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentAppointments.map((apt) => (
                        <tr key={apt.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{apt.pet_name || "Pet"}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                              {apt.owner_name || "Owner"}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>
                              {apt.service_type || "Veterinary Care"}
                            </div>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                              {formatDate(apt.appointment_date)}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                              {formatTime(apt.appointment_time)}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`admin-pill ${
                                (apt.status || "scheduled").toLowerCase()
                              }`}
                            >
                              {apt.status || "Scheduled"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="admin-empty-state" style={{ padding: "36px 16px" }}>
                    <p className="admin-empty-desc">No recent appointments booked.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
