import { useState, useEffect } from "react";
import {
  X,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Info,
  Syringe,
  PawPrint,
  Building2,
  FileText,
  Clock,
  AlertCircle,
} from "lucide-react";
import { validateVaccination } from "../../lib/vaccinationService";
import {
  calculateVaccinationStatus,
  getTodayDateString,
} from "../../lib/dateUtils";
import { calculatePetAge } from "../../lib/petService";
import "./health.css";

export default function VaccinationModal({
  isOpen,
  initialVaccination = null,
  pets = [],
  onClose,
  onSubmit,
  isSaving = false,
}) {
  const isEditing = Boolean(initialVaccination?.id);

  const [petId, setPetId] = useState("");
  const [vaccineName, setVaccineName] = useState("");
  const [dateGiven, setDateGiven] = useState(getTodayDateString());
  const [nextDueDate, setNextDueDate] = useState("");
  const [veterinarian, setVeterinarian] = useState("");
  const [notes, setNotes] = useState("");

  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Reset or synchronize form data whenever modal opens or initial data changes
  useEffect(() => {
    if (isOpen) {
      const defaultPetId =
        initialVaccination?.pet_id ||
        (pets.length === 1 ? String(pets[0].id) : "");

      setPetId(defaultPetId ? String(defaultPetId) : "");
      setVaccineName(initialVaccination?.vaccine_name || "");
      setDateGiven(initialVaccination?.date_given || getTodayDateString());
      setNextDueDate(initialVaccination?.next_due_date || "");
      setVeterinarian(initialVaccination?.veterinarian || "");
      setNotes(initialVaccination?.notes || "");
      setFormError("");
      setFieldErrors({});
    }
  }, [isOpen, initialVaccination, pets]);

  // Lock background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Selected pet details for rich preview card
  const selectedPet = pets.find((p) => String(p.id) === String(petId));
  const petPhoto = selectedPet?.photo_url || selectedPet?.image_url || selectedPet?.image;
  const petAge = selectedPet ? calculatePetAge(selectedPet.date_of_birth) : null;

  // Real-time calculated status preview
  const liveStatus = nextDueDate
    ? calculateVaccinationStatus(nextDueDate)
    : null;

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    const formData = {
      pet_id: petId,
      vaccine_name: vaccineName.trim(),
      date_given: dateGiven,
      next_due_date: nextDueDate,
      notes: notes.trim() || null,
      veterinarian: veterinarian.trim() || null,
    };

    // Run unified client validation
    const validation = validateVaccination(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstErrorKey = Object.keys(validation.errors)[0];
      setFormError(validation.errors[firstErrorKey]);
      return;
    }

    try {
      await onSubmit(formData, initialVaccination?.id);
    } catch (err) {
      console.error("VaccinationModal submit error:", err);
      setFormError("Unable to save vaccination. Please try again.");
    }
  };

  return (
    <div
      className="pawlio-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vax-modal-title"
    >
      <div
        className="vax-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="vax-modal-header">
          <div className="vax-modal-header-main">
            <div className="vax-modal-icon-badge" aria-hidden="true">
              <Syringe size={22} />
            </div>
            <div className="vax-modal-header-text">
              <span className="vax-modal-eyebrow">
                VACCINATION MANAGEMENT
              </span>
              <h2 id="vax-modal-title" className="vax-modal-title">
                {isEditing ? "Edit Vaccination" : "Add Vaccination"}
              </h2>
              <p className="vax-modal-subtitle">
                {isEditing
                  ? "Update immunization details and next booster schedule."
                  : "Keep your pet's immunization history organized and stay ahead of upcoming boosters."}
              </p>
            </div>
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

        {/* MODAL FORM */}
        <form className="vax-modal-form" onSubmit={handleSubmit} noValidate>
          <div className="vax-modal-body">
            {/* ERROR BANNER */}
            {formError && (
              <div className="vax-banner-error" role="alert">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{formError}</span>
              </div>
            )}

            {/* SECTION 1: PET INFORMATION */}
            <div className="vax-section-card">
              <div className="vax-section-header">
                <PawPrint size={15} />
                <span>Pet Information</span>
              </div>

              <div className="vax-field-group">
                <label htmlFor="vax-pet-select">
                  Select Pet <span className="vax-req-star">*</span>
                </label>
                <div className="vax-pet-select-wrap">
                  <select
                    id="vax-pet-select"
                    className={`vax-control ${
                      fieldErrors.pet_id ? "has-error" : ""
                    }`}
                    value={petId}
                    onChange={(e) => {
                      setPetId(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, pet_id: null }));
                    }}
                    required
                  >
                    <option value="">-- Choose your pet --</option>
                    {pets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.species} {p.breed ? `(${p.breed})` : ""}
                      </option>
                    ))}
                  </select>

                  {/* Selected Pet Quick Info Card */}
                  {selectedPet && (
                    <div className="vax-pet-preview-card">
                      <div className="vax-pet-preview-avatar">
                        {petPhoto ? (
                          <img
                            src={petPhoto}
                            alt={selectedPet.name}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <PawPrint size={20} />
                        )}
                      </div>
                      <div className="vax-pet-preview-info">
                        <span className="vax-pet-preview-name">
                          🐾 {selectedPet.name}
                        </span>
                        <span className="vax-pet-preview-meta">
                          {selectedPet.species}
                          {selectedPet.breed ? ` · ${selectedPet.breed}` : ""}
                          {petAge ? ` · ${petAge}` : ""}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {fieldErrors.pet_id && (
                  <span className="vax-inline-error">
                    <AlertCircle size={13} />
                    {fieldErrors.pet_id}
                  </span>
                )}
              </div>
            </div>

            {/* SECTION 2: VACCINE DETAILS */}
            <div className="vax-section-card">
              <div className="vax-section-header">
                <Syringe size={15} />
                <span>Vaccine Details</span>
              </div>

              {/* Vaccine Name */}
              <div className="vax-field-group">
                <label htmlFor="vax-name-input">
                  Vaccine Name <span className="vax-req-star">*</span>
                </label>
                <input
                  id="vax-name-input"
                  type="text"
                  className={`vax-control ${
                    fieldErrors.vaccine_name ? "has-error" : ""
                  }`}
                  placeholder="e.g. Rabies, DHPP, Bordetella, FVRCP"
                  value={vaccineName}
                  onChange={(e) => {
                    setVaccineName(e.target.value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      vaccine_name: null,
                    }));
                  }}
                  required
                />
                {fieldErrors.vaccine_name && (
                  <span className="vax-inline-error">
                    <AlertCircle size={13} />
                    {fieldErrors.vaccine_name}
                  </span>
                )}
              </div>

              {/* Dates Row: Date Given & Next Due Date */}
              <div className="vax-dates-row">
                <div className="vax-field-group">
                  <label htmlFor="vax-date-given">
                    Date Given <span className="vax-req-star">*</span>
                  </label>
                  <input
                    id="vax-date-given"
                    type="date"
                    className={`vax-control ${
                      fieldErrors.date_given ? "has-error" : ""
                    }`}
                    value={dateGiven}
                    onChange={(e) => {
                      setDateGiven(e.target.value);
                      setFieldErrors((prev) => ({
                        ...prev,
                        date_given: null,
                        next_due_date: null,
                      }));
                    }}
                    required
                  />
                  {fieldErrors.date_given && (
                    <span className="vax-inline-error">
                      <AlertCircle size={13} />
                      {fieldErrors.date_given}
                    </span>
                  )}
                </div>

                <div className="vax-field-group">
                  <label htmlFor="vax-next-due-date">
                    Next Due Date <span className="vax-req-star">*</span>
                  </label>
                  <input
                    id="vax-next-due-date"
                    type="date"
                    className={`vax-control ${
                      fieldErrors.next_due_date ? "has-error" : ""
                    }`}
                    value={nextDueDate}
                    onChange={(e) => {
                      setNextDueDate(e.target.value);
                      setFieldErrors((prev) => ({
                        ...prev,
                        next_due_date: null,
                      }));
                    }}
                    required
                  />
                  {fieldErrors.next_due_date && (
                    <span className="vax-inline-error">
                      <AlertCircle size={13} />
                      {fieldErrors.next_due_date}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: VACCINATION STATUS */}
            <div className="vax-section-card">
              <div className="vax-section-header">
                <ShieldCheck size={15} />
                <span>Vaccination Status</span>
              </div>

              {liveStatus ? (
                <div
                  className={`vax-status-box ${
                    liveStatus.status === "Up to Date"
                      ? "status-up-to-date"
                      : liveStatus.status === "Due Soon"
                      ? "status-due-soon"
                      : "status-overdue"
                  }`}
                >
                  <div className="vax-status-icon-box">
                    {liveStatus.status === "Up to Date" && (
                      <ShieldCheck size={20} />
                    )}
                    {liveStatus.status === "Due Soon" && <Clock size={20} />}
                    {liveStatus.status === "Overdue" && (
                      <AlertCircle size={20} />
                    )}
                  </div>

                  <div className="vax-status-details">
                    <div className="vax-status-headline">
                      <span
                        className={`vax-badge-pill ${
                          liveStatus.status === "Up to Date"
                            ? "badge-pill-up-to-date"
                            : liveStatus.status === "Due Soon"
                            ? "badge-pill-due-soon"
                            : "badge-pill-overdue"
                        }`}
                      >
                        {liveStatus.label}
                      </span>
                      <span className="vax-status-message">
                        {liveStatus.status === "Overdue" &&
                          `Overdue by ${Math.abs(liveStatus.daysDiff)} ${
                            Math.abs(liveStatus.daysDiff) === 1
                              ? "day"
                              : "days"
                          }`}
                        {liveStatus.status === "Due Soon" &&
                          `Due in ${liveStatus.daysDiff} ${
                            liveStatus.daysDiff === 1 ? "day" : "days"
                          } (within 30 days)`}
                        {liveStatus.status === "Up to Date" &&
                          `Due in ${liveStatus.daysDiff} days (more than 30 days away)`}
                      </span>
                    </div>
                    <span className="vax-status-caption">
                      Status automatically calculated from the Next Due Date.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="vax-status-box status-pending">
                  <div className="vax-status-icon-box">
                    <Info size={18} />
                  </div>
                  <div className="vax-status-details">
                    <div className="vax-status-headline">
                      <span className="vax-badge-pill badge-pill-pending">
                        Pending Date
                      </span>
                      <span className="vax-status-message">
                        Enter Next Due Date to calculate status
                      </span>
                    </div>
                    <span className="vax-status-caption">
                      Status automatically calculated from the Next Due Date.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: CARE PROVIDER */}
            <div className="vax-section-card">
              <div className="vax-section-header">
                <Building2 size={15} />
                <span>Care Provider</span>
              </div>

              <div className="vax-field-group">
                <label htmlFor="vax-vet-input">
                  Veterinarian / Clinic{" "}
                  <span className="vax-opt-tag">(Optional)</span>
                </label>
                <input
                  id="vax-vet-input"
                  type="text"
                  className="vax-control"
                  placeholder="e.g. Dr. Sharma / City Pet Care"
                  value={veterinarian}
                  onChange={(e) => setVeterinarian(e.target.value)}
                />
                <span className="vax-field-helper">
                  Optional — add the provider who administered the vaccine.
                </span>
              </div>
            </div>

            {/* SECTION 5: ADDITIONAL NOTES */}
            <div className="vax-section-card">
              <div className="vax-section-header">
                <FileText size={15} />
                <span>Additional Notes</span>
              </div>

              <div className="vax-field-group">
                <label htmlFor="vax-notes-input">
                  Notes <span className="vax-opt-tag">(Optional)</span>
                </label>
                <textarea
                  id="vax-notes-input"
                  className="vax-control vax-textarea"
                  rows={3}
                  placeholder="Add any useful details about the vaccination, reaction, dosage, or follow-up..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <span className="vax-field-helper">
                  Optional — keep track of batch numbers, certificate details, or observations.
                </span>
              </div>
            </div>
          </div>

          {/* DEDICATED STICKY MODAL FOOTER */}
          <div className="vax-modal-footer">
            <button
              type="button"
              className="vax-btn-cancel"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="vax-btn-save"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="pet-spinner"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>
                    {isEditing ? "Update Vaccination" : "Save Vaccination"}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
