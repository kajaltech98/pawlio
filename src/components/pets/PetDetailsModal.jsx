import { useEffect, useState } from "react";
import {
  X,
  PawPrint,
  Pencil,
  Trash2,
  Calendar,
  AlertTriangle,
  HeartPulse,
  PhoneCall,
  CalendarPlus,
  Stethoscope,
  ShieldCheck,
  Scale,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
import { calculatePetAge } from "../../lib/petService";
import { formatCalendarDate, calculateVaccinationStatus } from "../../lib/dateUtils";

export default function PetDetailsModal({
  isOpen,
  pet,
  onClose,
  onEdit,
  onDelete,
  onBookAppointment,
  onAddHealthRecord,
  onAddVaccination,
  healthRecords = [],
  vaccinations = [],
}) {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'records' | 'vaccinations' | 'appointments'

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !pet) return null;

  const age = calculatePetAge(pet.date_of_birth);
  const photo = pet.photo_url || pet.image_url || pet.image;

  const petHealthRecords = (healthRecords || []).filter(
    (r) => String(r.pet_id) === String(pet.id)
  );

  const petVaccinations = (vaccinations || []).filter(
    (v) => String(v.pet_id) === String(pet.id)
  );

  const sortedByNextDue = [...petVaccinations].sort((a, b) =>
    (a.next_due_date || "").localeCompare(b.next_due_date || "")
  );
  const nextVaccination = sortedByNextDue[0] || null;
  const nextVaxStatus = nextVaccination
    ? calculateVaccinationStatus(nextVaccination.next_due_date)
    : null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not provided";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="pawlio-modal-overlay" onClick={onClose}>
      <div className="pawlio-modal pet-profile-modal" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="pawlio-modal-header">
          <div>
            <span className="section-label">DIGITAL PET PROFILE</span>
            <h2>{pet.name}'s Health Passport</h2>
          </div>
          <button
            type="button"
            className="pawlio-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="pawlio-modal-body">
          {/* PET PROFILE HERO (Section 30) */}
          <div className="pet-profile-hero-card">
            <div className="pet-hero-avatar">
              {photo ? (
                <img
                  src={photo}
                  alt={pet.name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="pet-hero-avatar-fallback">
                  <PawPrint size={40} />
                </div>
              )}
            </div>

            <div className="pet-hero-main-info">
              <div className="pet-hero-title-row">
                <h3>{pet.name}</h3>
                <span className="pet-hero-species-badge">{pet.species}</span>
              </div>
              <p className="pet-hero-breed">
                {pet.breed || "Breed unspecified"}
              </p>
              <div className="pet-hero-meta-row">
                {age && <span>{age}</span>}
                {pet.gender && <span>· {pet.gender}</span>}
                {pet.weight && <span>· {pet.weight} kg</span>}
              </div>
            </div>

            <div className="pet-hero-actions">
              <button
                type="button"
                className="btn-hero-edit"
                onClick={() => {
                  onClose();
                  onEdit(pet);
                }}
              >
                <Pencil size={13} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* HEALTH OVERVIEW METRICS (Section 29) */}
          <div className="pet-overview-metric-grid">
            <div className="pet-metric-card">
              <span className="metric-label">Weight</span>
              <strong className="metric-val">
                {pet.weight ? `${pet.weight} kg` : "—"}
              </strong>
              <small className="metric-hint">Current weight</small>
            </div>

            <div className="pet-metric-card">
              <span className="metric-label">Vaccination</span>
              <strong className="metric-val" style={{ color: nextVaxStatus?.badgeClass?.includes("overdue") ? "#d95c5c" : "var(--primary)" }}>
                {petVaccinations.length === 0 ? "No records" : nextVaxStatus ? nextVaxStatus.label : "Up to date"}
              </strong>
              <small className="metric-hint">
                {nextVaccination ? nextVaccination.vaccine_name : petVaccinations.length === 0 ? "No vaccine added" : "All clear"}
              </small>
            </div>

            <div className="pet-metric-card">
              <span className="metric-label">Health Records</span>
              <strong className="metric-val">
                {petHealthRecords.length}
              </strong>
              <small className="metric-hint">Documented visits</small>
            </div>

            <div className="pet-metric-card">
              <span className="metric-label">Age</span>
              <strong className="metric-val">{age || "—"}</strong>
              <small className="metric-hint">
                {pet.date_of_birth ? formatDate(pet.date_of_birth) : "Age tracked"}
              </small>
            </div>
          </div>

          {/* TABS NAVIGATION (Overview | Health Records | Vaccinations | Appointments) */}
          <div className="pet-modal-tabs">
            <button
              type="button"
              className={`pet-modal-tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              type="button"
              className={`pet-modal-tab ${activeTab === "records" ? "active" : ""}`}
              onClick={() => setActiveTab("records")}
            >
              Health Records ({petHealthRecords.length})
            </button>
            <button
              type="button"
              className={`pet-modal-tab ${activeTab === "vaccinations" ? "active" : ""}`}
              onClick={() => setActiveTab("vaccinations")}
            >
              Vaccinations ({petVaccinations.length})
            </button>
            <button
              type="button"
              className={`pet-modal-tab ${activeTab === "appointments" ? "active" : ""}`}
              onClick={() => setActiveTab("appointments")}
            >
              Appointments
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="pet-tab-pane">
              {/* PHYSICAL ATTRIBUTES */}
              <div className="pet-details-grid">
                <div className="pet-info-card">
                  <span>Species</span>
                  <strong>{pet.species || "Unspecified"}</strong>
                </div>

                <div className="pet-info-card">
                  <span>Breed</span>
                  <strong>{pet.breed || "Unspecified"}</strong>
                </div>

                <div className="pet-info-card">
                  <span>Gender</span>
                  <strong>{pet.gender || "Unspecified"}</strong>
                </div>

                <div className="pet-info-card">
                  <span>Date of Birth</span>
                  <strong>{formatDate(pet.date_of_birth)}</strong>
                </div>

                <div className="pet-info-card">
                  <span>Weight</span>
                  <strong>
                    {pet.weight !== null && pet.weight !== "" && pet.weight !== undefined
                      ? `${pet.weight} kg`
                      : "Not recorded"}
                  </strong>
                </div>

                <div className="pet-info-card">
                  <span>Color / Markings</span>
                  <strong>{pet.color || "Not recorded"}</strong>
                </div>
              </div>

              {/* ALLERGIES */}
              <div className={`pet-section-box ${pet.allergies ? "alert-box" : ""}`}>
                <h4>
                  <AlertTriangle size={15} />
                  <span>Known Allergies</span>
                </h4>
                <p>
                  {pet.allergies ? (
                    <strong>{pet.allergies}</strong>
                  ) : (
                    <span style={{ color: "var(--muted)" }}>
                      No known allergies reported for {pet.name}.
                    </span>
                  )}
                </p>
              </div>

              {/* MEDICAL CONDITIONS */}
              <div className="pet-section-box">
                <h4>
                  <HeartPulse size={15} />
                  <span>Medical Conditions & Notes</span>
                </h4>
                <p>
                  {pet.medical_conditions ? (
                    pet.medical_conditions
                  ) : (
                    <span style={{ color: "var(--muted)" }}>
                      No chronic or ongoing medical conditions recorded.
                    </span>
                  )}
                </p>
              </div>

              {/* EMERGENCY INFO */}
              <div className="pet-section-box">
                <h4>
                  <PhoneCall size={15} />
                  <span>Emergency Information</span>
                </h4>
                <p>
                  {pet.emergency_information ? (
                    pet.emergency_information
                  ) : (
                    <span style={{ color: "var(--muted)" }}>
                      No emergency contacts or instructions recorded yet.
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: HEALTH RECORDS */}
          {activeTab === "records" && (
            <div className="pet-tab-pane">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", color: "var(--muted)", fontWeight: 600 }}>
                  Medical records for {pet.name}
                </span>
                {onAddHealthRecord && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ height: "32px", fontSize: "12px", padding: "0 12px" }}
                    onClick={() => {
                      onClose();
                      onAddHealthRecord(pet);
                    }}
                  >
                    <Plus size={13} /> Add Record
                  </button>
                )}
              </div>

              {petHealthRecords.length === 0 ? (
                <div className="empty-dashboard-state" style={{ padding: "28px 16px" }}>
                  <Stethoscope size={24} />
                  <p>No health records for {pet.name} yet.</p>
                </div>
              ) : (
                <div className="pet-records-list">
                  {petHealthRecords.map((rec) => (
                    <div key={rec.id} className="pet-record-item-card">
                      <div className="pet-rec-icon">
                        <Stethoscope size={16} />
                      </div>
                      <div className="pet-rec-content">
                        <div className="pet-rec-header">
                          <strong>{rec.title}</strong>
                          <span className="health-type-pill">{rec.record_type}</span>
                        </div>
                        <p className="pet-rec-desc">{rec.description || "No description provided."}</p>
                        <div className="pet-rec-footer">
                          <span>{formatCalendarDate(rec.record_date)}</span>
                          {rec.veterinarian && <span>· Vet: {rec.veterinarian}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VACCINATIONS */}
          {activeTab === "vaccinations" && (
            <div className="pet-tab-pane">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", color: "var(--muted)", fontWeight: 600 }}>
                  Vaccination history for {pet.name}
                </span>
                {onAddVaccination && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ height: "32px", fontSize: "12px", padding: "0 12px" }}
                    onClick={() => {
                      onClose();
                      onAddVaccination(pet);
                    }}
                  >
                    <Plus size={13} /> Add Vaccine
                  </button>
                )}
              </div>

              {petVaccinations.length === 0 ? (
                <div className="empty-dashboard-state" style={{ padding: "28px 16px" }}>
                  <ShieldCheck size={24} />
                  <p>No vaccination history recorded for {pet.name}.</p>
                </div>
              ) : (
                <div className="pet-records-list">
                  {petVaccinations.map((vax) => {
                    const status = calculateVaccinationStatus(vax.next_due_date);
                    return (
                      <div key={vax.id} className="pet-record-item-card">
                        <div className="pet-rec-icon" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                          <ShieldCheck size={16} />
                        </div>
                        <div className="pet-rec-content">
                          <div className="pet-rec-header">
                            <strong>{vax.vaccine_name}</strong>
                            <span className={`vaccine-status-pill ${status.badgeClass}`}>{status.label}</span>
                          </div>
                          <div className="pet-rec-footer" style={{ marginTop: 4 }}>
                            <span>Given: {formatCalendarDate(vax.date_given)}</span>
                            <span>· Next Due: {formatCalendarDate(vax.next_due_date)}</span>
                            {vax.veterinarian && <span>· Vet: {vax.veterinarian}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: APPOINTMENTS */}
          {activeTab === "appointments" && (
            <div className="pet-tab-pane">
              <div className="pet-book-appointment-cta">
                <CalendarPlus size={32} color="var(--primary)" />
                <h4>Schedule a visit for {pet.name}</h4>
                <p>Book checkups, vaccinations, grooming, or veterinary consultations in seconds.</p>
                {onBookAppointment && (
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ marginTop: 12, padding: "10px 20px" }}
                    onClick={() => {
                      onClose();
                      onBookAppointment(pet);
                    }}
                  >
                    <CalendarPlus size={16} />
                    <span>Book Appointment for {pet.name}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="pawlio-modal-footer">
          <button
            type="button"
            className="btn-danger"
            onClick={() => {
              onClose();
              onDelete(pet);
            }}
          >
            <Trash2 size={14} />
            <span>Delete Pet</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
