import { useEffect, useState } from "react";
import {
  Briefcase,
  Plus,
  Edit2,
  Power,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Clock,
  Tag,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  fetchAdminServices,
  createAdminService,
  updateAdminService,
  toggleServiceActive,
  deduplicateServices,
} from "../../lib/adminService";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "500",
    duration_minutes: 30,
    category: "Veterinary",
    active: true,
    is_active: true,
  });
  const [formError, setFormError] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminServices();
      setServices(data);
    } catch (err) {
      console.error("Failed to load services:", err);
      setError("Unable to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openAddModal = () => {
    setFormData({
      name: "",
      description: "",
      price: "500",
      duration_minutes: 30,
      category: "Veterinary",
      active: true,
      is_active: true,
    });
    setFormError("");
    setShowAddModal(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    const dur = service.duration_minutes || (parseInt(service.duration, 10) || 30);
    const isAct = service.active !== undefined ? service.active : (service.is_active !== false);
    setFormData({
      name: service.name || "",
      description: service.description || "",
      price: service.price ?? 0,
      duration_minutes: dur,
      category: service.category || "General",
      active: isAct,
      is_active: isAct,
    });
    setFormError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedDesc = formData.description.trim();
    const priceNum = parseFloat(formData.price);
    const durNum = parseInt(formData.duration_minutes, 10);

    // Strict Validation as per Requirement 16 & 18
    if (!trimmedName) {
      setFormError("Service name is required.");
      return;
    }
    if (trimmedName.length > 120) {
      setFormError("Service name cannot exceed 120 characters.");
      return;
    }
    if (!trimmedDesc) {
      setFormError("Description is required.");
      return;
    }
    if (trimmedDesc.length > 1000) {
      setFormError("Description cannot exceed 1000 characters.");
      return;
    }
    if (!formData.category || !formData.category.trim()) {
      setFormError("Category is required.");
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError("Price must be a valid number of 0 or greater.");
      return;
    }
    if (isNaN(durNum) || durNum <= 0) {
      setFormError("Duration must be a positive number of minutes (e.g. 30).");
      return;
    }

    setSaving(true);
    setFormError("");

    const payload = {
      name: trimmedName,
      description: trimmedDesc,
      price: priceNum,
      duration_minutes: durNum,
      duration: `${durNum} mins`,
      category: formData.category.trim(),
      active: Boolean(formData.active),
      is_active: Boolean(formData.active),
    };

    try {
      if (editingService) {
        // Edit service
        const updated = await updateAdminService(editingService.id, payload);
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? { ...s, ...updated } : s))
        );
        setEditingService(null);
        showToast("Service updated successfully.");
      } else {
        // Add service
        const created = await createAdminService(payload);
        setServices((prev) => deduplicateServices([created, ...prev]));
        setShowAddModal(false);
        showToast("Service added successfully.");
      }
    } catch (err) {
      console.error("Save service error:", err);
      setFormError("Failed to save service. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (service) => {
    try {
      setTogglingId(service.id);
      const isCurrentlyActive = service.is_active !== false;
      await toggleServiceActive(service.id, isCurrentlyActive);

      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id ? { ...s, is_active: !isCurrentlyActive } : s
        )
      );

      const statusText = !isCurrentlyActive ? "activated" : "deactivated";
      showToast(`Service "${service.name}" ${statusText} successfully.`);
    } catch (err) {
      console.error("Toggle service error:", err);
      showToast("Could not update service status. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  // Filter services
  const filteredServices = services.filter((s) => {
    const isActive = s.is_active !== false;

    if (statusFilter === "active" && !isActive) return false;
    if (statusFilter === "inactive" && isActive) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = (s.name || "").toLowerCase().includes(q);
      const descMatch = (s.description || "").toLowerCase().includes(q);
      const catMatch = (s.category || "").toLowerCase().includes(q);
      return nameMatch || descMatch || catMatch;
    }

    return true;
  });

  return (
    <AdminLayout title="Service Management">
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
            Pet Care & Clinical Services
          </h2>
          <p className="admin-subtitle">
            Manage services offered to pet parents, edit descriptions, adjust pricing, and toggle availability.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={loadServices}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "animate-spin-slow" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="admin-btn-primary"
            onClick={openAddModal}
          >
            <Plus size={16} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Controls: Search and Status Filters */}
      <div className="admin-controls-bar">
        <div className="admin-search-wrapper">
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search services by title or category..."
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
            All ({services.length})
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${statusFilter === "active" ? "active" : ""}`}
            onClick={() => setStatusFilter("active")}
          >
            Active ({services.filter((s) => s.is_active !== false).length})
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${statusFilter === "inactive" ? "active" : ""}`}
            onClick={() => setStatusFilter("inactive")}
          >
            Inactive ({services.filter((s) => s.is_active === false).length})
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        {loading ? (
          <div className="admin-loading-container">
            <div className="admin-spinner" />
            <p style={{ fontWeight: 600 }}>Loading services...</p>
          </div>
        ) : error ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon" style={{ color: "#dc2626", background: "#fee2e2" }}>
              <AlertCircle size={28} />
            </div>
            <h3 className="admin-empty-title">Error Loading Services</h3>
            <p className="admin-empty-desc">{error}</p>
            <button
              type="button"
              className="admin-btn-primary"
              style={{ marginTop: 14 }}
              onClick={loadServices}
            >
              Retry
            </button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <Briefcase size={28} />
            </div>
            <h3 className="admin-empty-title">No Services Found</h3>
            <p className="admin-empty-desc">
              {searchQuery
                ? "No services match your search."
                : "No services have been added yet."}
            </p>
            {!searchQuery && (
              <button
                type="button"
                className="admin-btn-primary"
                style={{ marginTop: 14 }}
                onClick={openAddModal}
              >
                <Plus size={16} />
                <span>Add Your First Service</span>
              </button>
            )}
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((srv) => {
                  const isActive = srv.is_active !== false;
                  const isToggling = togglingId === srv.id;

                  return (
                    <tr key={srv.id}>
                      {/* Name */}
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--admin-text-main)" }}>
                          {srv.name}
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: "12px",
                            background: "#f1f5f3",
                            color: "var(--admin-primary)",
                          }}
                        >
                          {srv.category || "General"}
                        </span>
                      </td>

                      {/* Description */}
                      <td>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--admin-text-muted)",
                            maxWidth: 320,
                            lineHeight: 1.4,
                          }}
                        >
                          {srv.description || "—"}
                        </div>
                      </td>

                      {/* Price */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                          ₹{srv.price ?? 0}
                        </div>
                      </td>

                      {/* Duration */}
                      <td>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "0.82rem",
                            color: "var(--admin-text-muted)",
                          }}
                        >
                          <Clock size={13} />
                          <span>{srv.duration || "30 mins"}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`admin-pill ${isActive ? "active" : "inactive"}`}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", gap: 8 }}>
                          {/* Edit button */}
                          <button
                            type="button"
                            className="admin-btn-secondary"
                            onClick={() => openEditModal(srv)}
                            title="Edit Service Details"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          {/* Deactivate / Activate button (never hard deletes) */}
                          <button
                            type="button"
                            className={isActive ? "admin-btn-danger-outline" : "admin-btn-secondary"}
                            onClick={() => handleToggleActive(srv)}
                            disabled={isToggling}
                            title={
                              isActive
                                ? "Deactivate service (hide from user booking)"
                                : "Activate service"
                            }
                          >
                            <Power size={13} />
                            <span>
                              {isToggling
                                ? "..."
                                : isActive
                                ? "Deactivate"
                                : "Activate"}
                            </span>
                          </button>
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

      {/* Add / Edit Service Modal */}
      {(showAddModal || editingService) && (
        <div className="admin-modal-backdrop" onClick={() => {
          if (!saving) {
            setShowAddModal(false);
            setEditingService(null);
          }
        }}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingService ? "Edit Service" : "Add New Service"}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingService(null);
                }}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                {formError && (
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "#fee2e2",
                      color: "#dc2626",
                      borderRadius: 8,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {formError}
                  </div>
                )}

                {/* Service Name */}
                <div className="admin-form-group">
                  <label htmlFor="service-name">
                    Service Name <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    id="service-name"
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Ultrasonic Dental Scaling"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Category */}
                <div className="admin-form-group">
                  <label htmlFor="service-category">Category</label>
                  <select
                    id="service-category"
                    className="admin-form-select"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="Veterinary">Veterinary Consultation</option>
                    <option value="Grooming">Pet Grooming & Spa</option>
                    <option value="Preventive">Preventive & Vaccinations</option>
                    <option value="Training">Behavioral Training</option>
                    <option value="Boarding">Day Care & Boarding</option>
                    <option value="General">General Wellness</option>
                  </select>
                </div>

                {/* Price & Duration */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="admin-form-group">
                    <label htmlFor="service-price">Price (₹)</label>
                    <input
                      id="service-price"
                      type="number"
                      min="0"
                      step="50"
                      className="admin-form-input"
                      placeholder="e.g. 750"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="service-duration-minutes">Duration (minutes) <span style={{ color: "#dc2626" }}>*</span></label>
                    <input
                      id="service-duration-minutes"
                      type="number"
                      min="5"
                      step="5"
                      className="admin-form-input"
                      placeholder="e.g. 30"
                      value={formData.duration_minutes}
                      onChange={(e) =>
                        setFormData({ ...formData, duration_minutes: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="admin-form-group">
                  <label htmlFor="service-desc">
                    Description <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    id="service-desc"
                    rows="3"
                    className="admin-form-textarea"
                    placeholder="Describe what is included in this service..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Active Checkbox */}
                <label className="admin-checkbox-row" style={{ marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        active: e.target.checked,
                        is_active: e.target.checked,
                      })
                    }
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      Active Service
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)" }}>
                      When active, users can book this service on their dashboard.
                    </div>
                  </div>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingService(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingService
                    ? "Save Changes"
                    : "Add Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
