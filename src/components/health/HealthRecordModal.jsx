import { useState, useEffect } from "react";
import { X, ArrowRight, HeartPulse, Sparkles } from "lucide-react";
import { HEALTH_RECORD_TYPES, validateHealthRecord } from "../../lib/healthRecordService";
import { getTodayDateString } from "../../lib/dateUtils";

export default function HealthRecordModal({
  isOpen,
  initialRecord = null,
  pets = [],
  onClose,
  onSubmit,
  isSaving = false,
}) {
  const isEditing = Boolean(initialRecord?.id);

  const [petId, setPetId] = useState("");
  const [recordType, setRecordType] = useState("Checkup");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recordDate, setRecordDate] = useState(getTodayDateString());
  const [veterinarian, setVeterinarian] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Synchronize and reset form state whenever modal opens or initialRecord changes
  useEffect(() => {
    if (isOpen) {
      setPetId(
        initialRecord?.pet_id || (pets.length === 1 ? String(pets[0].id) : "")
      );
      setRecordType(initialRecord?.record_type || "Checkup");
      setTitle(initialRecord?.title || "");
      setDescription(initialRecord?.description || initialRecord?.notes || "");
      setRecordDate(initialRecord?.record_date || getTodayDateString());
      setVeterinarian(initialRecord?.veterinarian || "");
      setFormError("");
      setFieldErrors({});
    }
  }, [isOpen, initialRecord, pets]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    const formData = {
      pet_id: petId,
      record_type: recordType,
      title: title.trim(),
      description: description.trim() || null,
      notes: description.trim() || null,
      record_date: recordDate,
      veterinarian: veterinarian.trim() || null,
      follow_up_date: initialRecord?.follow_up_date || null,
    };

    const validation = validateHealthRecord(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      setFormError(firstError);
      return;
    }

    try {
      await onSubmit(formData, initialRecord?.id);
    } catch (err) {
      console.error("HealthRecordModal submit error:", err);
      setFormError("Unable to save health record. Please try again.");
    }
  };

  return (
    <div className="pawlio-modal-overlay" onClick={onClose}>
      <div
        className="pawlio-modal"
        style={{ maxWidth: 540 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="pawlio-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "var(--primary-light, #DDF5EF)",
                color: "var(--primary, #0F766E)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <HeartPulse size={22} />
            </div>
            <div>
              <span className="section-label" style={{ letterSpacing: "0.5px" }}>
                PET HEALTH RECORD
              </span>
              <h2 style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: 800 }}>
                {isEditing ? "Edit Health Record" : "Add Health Record"}
              </h2>
              <p style={{ margin: "3px 0 0", fontSize: "13px", color: "var(--muted, #6B7773)" }}>
                {isEditing
                  ? "Update your pet's care history and clinic visit details."
                  : "Keep track of an important part of your pet's health journey."}
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

        {/* FORM */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <div className="pawlio-modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {formError && <div className="form-error-badge">{formError}</div>}

            {/* 1. PET SELECTION */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--dark, #12312D)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                Pet <span style={{ color: "#e15b5b" }}>*</span>
              </label>
              <select
                value={petId}
                onChange={(e) => {
                  setPetId(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, pet_id: null }));
                }}
                required
                style={{
                  height: "44px",
                  borderRadius: "10px",
                  borderColor: fieldErrors.pet_id ? "#e15b5b" : "var(--border, #E5ECE9)",
                }}
              >
                <option value="">Select Pet</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.species} {p.breed ? `(${p.breed})` : ""}
                  </option>
                ))}
              </select>
              {fieldErrors.pet_id && (
                <span className="field-error" style={{ fontSize: "12px", color: "#e15b5b", marginTop: 4 }}>
                  {fieldErrors.pet_id}
                </span>
              )}
            </div>

            {/* 2. RECORD TYPE & DATE (2 columns) */}
            <div className="pet-form-row" style={{ gap: 14 }}>
              {/* RECORD TYPE */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--dark, #12312D)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  Record Type <span style={{ color: "#e15b5b" }}>*</span>
                </label>
                <select
                  value={recordType}
                  onChange={(e) => {
                    setRecordType(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, record_type: null }));
                  }}
                  required
                  style={{
                    height: "44px",
                    borderRadius: "10px",
                    borderColor: fieldErrors.record_type ? "#e15b5b" : "var(--border, #E5ECE9)",
                  }}
                >
                  <option value="">Select record type</option>
                  {HEALTH_RECORD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {fieldErrors.record_type && (
                  <span className="field-error" style={{ fontSize: "12px", color: "#e15b5b", marginTop: 4 }}>
                    {fieldErrors.record_type}
                  </span>
                )}
              </div>

              {/* DATE */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--dark, #12312D)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  Date <span style={{ color: "#e15b5b" }}>*</span>
                </label>
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => {
                    setRecordDate(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, record_date: null }));
                  }}
                  required
                  style={{
                    height: "44px",
                    borderRadius: "10px",
                    borderColor: fieldErrors.record_date ? "#e15b5b" : "var(--border, #E5ECE9)",
                  }}
                />
                {fieldErrors.record_date && (
                  <span className="field-error" style={{ fontSize: "12px", color: "#e15b5b", marginTop: 4 }}>
                    {fieldErrors.record_date}
                  </span>
                )}
              </div>
            </div>

            {/* 3. RECORD TITLE */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--dark, #12312D)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                Record Title <span style={{ color: "#e15b5b" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Annual Health Check"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, title: null }));
                }}
                required
                style={{
                  height: "44px",
                  borderRadius: "10px",
                  borderColor: fieldErrors.title ? "#e15b5b" : "var(--border, #E5ECE9)",
                }}
              />
              {fieldErrors.title && (
                <span className="field-error" style={{ fontSize: "12px", color: "#e15b5b", marginTop: 4 }}>
                  {fieldErrors.title}
                </span>
              )}
            </div>

            {/* 4. VETERINARIAN */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--dark, #12312D)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                Veterinarian <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--muted, #6B7773)", textTransform: "none" }}>(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Priya Sharma / City Vet Clinic"
                value={veterinarian}
                onChange={(e) => setVeterinarian(e.target.value)}
                style={{
                  height: "44px",
                  borderRadius: "10px",
                  borderColor: "var(--border, #E5ECE9)",
                }}
              />
            </div>

            {/* 5. DESCRIPTION / NOTES */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--dark, #12312D)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                Description / Notes <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--muted, #6B7773)", textTransform: "none" }}>(Optional)</span>
              </label>
              <textarea
                rows="3"
                placeholder="Describe the visit, treatment or important information..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  borderRadius: "10px",
                  borderColor: "var(--border, #E5ECE9)",
                  padding: "10px 14px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  lineHeight: 1.5,
                  resize: "vertical",
                  minHeight: "84px",
                }}
              />
            </div>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="pawlio-modal-footer" style={{ borderTop: "1px solid var(--border, #E5ECE9)" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSaving}
              style={{ height: "44px", padding: "0 20px", borderRadius: "10px" }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="auth-submit"
              style={{
                width: "auto",
                minWidth: 170,
                height: "44px",
                borderRadius: "10px",
                background: "var(--primary, #0F766E)",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="pet-spinner"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>{isEditing ? "Update Health Record" : "Save Health Record"}</span>
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
