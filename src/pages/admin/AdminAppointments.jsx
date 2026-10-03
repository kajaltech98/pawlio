import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  User,
  PawPrint,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  fetchAdminAppointments,
  updateAdminAppointmentStatus,
} from "../../lib/adminService";
import { formatAppointmentTime } from "../../lib/dateUtils";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'scheduled' | 'completed' | 'cancelled'
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError("Unable to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      setUpdatingId(appointmentId);
      await updateAdminAppointmentStatus(appointmentId, newStatus);

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );

      showToast(`Appointment status updated to ${newStatus.toUpperCase()}.`);
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast("Could not update status. Please try again.");
    } finally {
      setUpdatingId(null);
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

  const formatTime = (timeStr) => {
    return formatAppointmentTime(timeStr);
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    // 1. Status Filter
    if (statusFilter !== "all") {
      const currentStatus = (apt.status || "scheduled").toLowerCase();
      if (currentStatus !== statusFilter) return false;
    }

    // 2. Search Query (Pet, Service, Owner)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const petMatch = (apt.pet_name || "").toLowerCase().includes(q);
      const ownerMatch = (apt.owner_name || "").toLowerCase().includes(q);
      const serviceMatch = (apt.service_type || "").toLowerCase().includes(q);
      return petMatch || ownerMatch || serviceMatch;
    }

    return true;
  });

  // Calculate counts for pills
  const scheduledCount = appointments.filter(
    (a) => (a.status || "scheduled").toLowerCase() === "scheduled"
  ).length;
  const completedCount = appointments.filter(
    (a) => (a.status || "").toLowerCase() === "completed"
  ).length;
  const cancelledCount = appointments.filter(
    (a) => (a.status || "").toLowerCase() === "cancelled"
  ).length;

  return (
    <AdminLayout title="Appointment Management">
      {/* Toast Notification */}
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
            All Scheduled Care Appointments
          </h2>
          <p className="admin-subtitle">
            Manage clinic consultations, grooming appointments, and update booking status.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-secondary"
          onClick={loadAppointments}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? "animate-spin-slow" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Controls: Search and Status Filters */}
      <div className="admin-controls-bar">
        <div className="admin-search-wrapper">
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by pet, service, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-filter-group">
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--admin-text-muted)" }}>
            Status:
          </span>
          <button
            type="button"
            className={`admin-filter-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All ({appointments.length})
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${statusFilter === "scheduled" ? "active" : ""}`}
            onClick={() => setStatusFilter("scheduled")}
          >
            Scheduled ({scheduledCount})
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${statusFilter === "completed" ? "active" : ""}`}
            onClick={() => setStatusFilter("completed")}
          >
            Completed ({completedCount})
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${statusFilter === "cancelled" ? "active" : ""}`}
            onClick={() => setStatusFilter("cancelled")}
          >
            Cancelled ({cancelledCount})
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        {loading ? (
          <div className="admin-loading-container">
            <div className="admin-spinner" />
            <p style={{ fontWeight: 600 }}>Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon" style={{ color: "#dc2626", background: "#fee2e2" }}>
              <AlertCircle size={28} />
            </div>
            <h3 className="admin-empty-title">Error Loading Appointments</h3>
            <p className="admin-empty-desc">{error}</p>
            <button
              type="button"
              className="admin-btn-primary"
              style={{ marginTop: 14 }}
              onClick={loadAppointments}
            >
              Retry
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <CalendarCheck size={28} />
            </div>
            <h3 className="admin-empty-title">No Appointments Found</h3>
            <p className="admin-empty-desc">
              {searchQuery
                ? "No appointments match your search term."
                : "No appointments have been booked yet."}
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>Owner</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => {
                  const status = (apt.status || "scheduled").toLowerCase();
                  const isUpdating = updatingId === apt.id;

                  return (
                    <tr key={apt.id}>
                      {/* Pet */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "8px",
                              background: "rgba(30, 112, 74, 0.1)",
                              color: "var(--admin-primary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <PawPrint size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{apt.pet_name || "Pet"}</div>
                            {apt.pet_species && (
                              <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                                {apt.pet_species}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Owner */}
                      <td>
                        <div style={{ fontWeight: 600 }}>{apt.owner_name || "Pet Parent"}</div>
                        {apt.owner_phone && (
                          <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                            {apt.owner_phone}
                          </div>
                        )}
                      </td>

                      {/* Service */}
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {apt.service_type || "Veterinary Care"}
                        </div>
                        {apt.notes && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--admin-text-muted)",
                              maxWidth: 180,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={apt.notes}
                          >
                            Note: {apt.notes}
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td style={{ whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                          {formatDate(apt.appointment_date)}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)" }}>
                          {formatTime(apt.appointment_time)}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td>
                        <span className={`admin-pill ${status}`}>
                          {status === "scheduled" && <Clock size={12} />}
                          {status === "completed" && <CheckCircle size={12} />}
                          {status === "cancelled" && <XCircle size={12} />}
                          {apt.status || "Scheduled"}
                        </span>
                      </td>

                      {/* Status Action Buttons */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          {status !== "completed" && (
                            <button
                              type="button"
                              className="admin-btn-secondary"
                              onClick={() => handleStatusChange(apt.id, "completed")}
                              disabled={isUpdating}
                              style={{
                                fontSize: "0.78rem",
                                padding: "4px 8px",
                                color: "#15803d",
                              }}
                              title="Mark this appointment as Completed"
                            >
                              <CheckCircle size={13} />
                              Complete
                            </button>
                          )}

                          {status !== "scheduled" && (
                            <button
                              type="button"
                              className="admin-btn-secondary"
                              onClick={() => handleStatusChange(apt.id, "scheduled")}
                              disabled={isUpdating}
                              style={{ fontSize: "0.78rem", padding: "4px 8px" }}
                              title="Set status back to Scheduled"
                            >
                              <Clock size={13} />
                              Schedule
                            </button>
                          )}

                          {status !== "cancelled" && (
                            <button
                              type="button"
                              className="admin-btn-danger-outline"
                              onClick={() => handleStatusChange(apt.id, "cancelled")}
                              disabled={isUpdating}
                              style={{ fontSize: "0.78rem", padding: "4px 8px" }}
                              title="Cancel this appointment"
                            >
                              <XCircle size={13} />
                              Cancel
                            </button>
                          )}
                        </div>
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
