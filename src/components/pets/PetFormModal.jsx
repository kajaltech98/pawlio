import { useState, useEffect } from "react";
import { X, PawPrint, AlertCircle, Save, Image as ImageIcon } from "lucide-react";
import { validatePetForm } from "../../lib/petService";
import PetDatePicker from "./PetDatePicker";

const SPECIES_OPTIONS = [
  "Dog",
  "Cat",
  "Bird",
  "Rabbit",
  "Hamster",
  "Fish",
  "Reptile",
  "Horse",
  "Other",
];

const GENDER_OPTIONS = ["Male", "Female", "Unknown"];

export default function PetFormModal({
  isOpen,
  initialPet = null,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const isEditing = Boolean(initialPet?.id);

  const [formData, setFormData] = useState({
    name: initialPet?.name || "",
    species: initialPet?.species || "Dog",
    breed: initialPet?.breed || "",
    gender: initialPet?.gender || "",
    date_of_birth: initialPet?.date_of_birth || "",
    weight: initialPet?.weight !== null && initialPet?.weight !== undefined ? initialPet.weight : "",
    color: initialPet?.color || "",
    allergies: initialPet?.allergies || "",
    medical_conditions: initialPet?.medical_conditions || "",
    emergency_information: initialPet?.emergency_information || "",
    photo_url: initialPet?.photo_url || initialPet?.image_url || initialPet?.image || "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [imgLoadError, setImgLoadError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (name === "photo_url") {
      setImgLoadError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    const validation = validatePetForm(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      setGeneralError(firstError);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error("Pet form submit error:", err);
      setGeneralError(err.message || "Failed to save pet details. Please check the inputs.");
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="pawlio-modal-overlay" onClick={onClose}>
      <div className="pawlio-modal" onClick={(e) => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div className="pawlio-modal-header">
          <div>
            <span className="section-label">
              {isEditing ? "EDIT PET PROFILE" : "NEW PET PROFILE"}
            </span>
            <h2>{isEditing ? `Edit ${initialPet.name}` : "Add a New Pet"}</h2>
            <p>
              {isEditing
                ? "Update your pet's information, medical details, and emergency contacts."
                : "Fill in the details below to add your companion to PAWLIO."}
            </p>
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

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="pawlio-modal-body" id="pet-form">
          {generalError && (
            <div className="form-error-badge" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={16} />
              <span>{generalError}</span>
            </div>
          )}

          {/* BASIC INFORMATION */}
          <div className="pet-form-section-title">
            <PawPrint size={14} />
            <span>Basic Information</span>
          </div>

          <div className="pet-form-grid-2">
            <div className="pet-form-group">
              <label htmlFor="pet-name">
                <span>
                  Pet Name<span className="req">*</span>
                </span>
              </label>
              <input
                id="pet-name"
                name="name"
                type="text"
                className={`pet-input ${fieldErrors.name ? "input-error" : ""}`}
                placeholder="e.g. Bella, Milo, Coco"
                value={formData.name}
                onChange={handleChange}
                required
                autoFocus
              />
              {fieldErrors.name && (
                <span className="field-error-msg">{fieldErrors.name}</span>
              )}
            </div>

            <div className="pet-form-group">
              <label htmlFor="pet-species">
                <span>
                  Species<span className="req">*</span>
                </span>
              </label>
              <select
                id="pet-species"
                name="species"
                className={`pet-select ${fieldErrors.species ? "input-error" : ""}`}
                value={formData.species}
                onChange={handleChange}
                required
              >
                {SPECIES_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {fieldErrors.species && (
                <span className="field-error-msg">{fieldErrors.species}</span>
              )}
            </div>
          </div>

          {/* PHYSICAL & IDENTITY */}
          <div className="pet-form-section-title">
            <span>Physical & Identification</span>
          </div>

          <div className="pet-form-grid-2">
            <div className="pet-form-group">
              <label htmlFor="pet-breed">
                <span>Breed</span>
                <span className="opt">Optional</span>
              </label>
              <input
                id="pet-breed"
                name="breed"
                type="text"
                className="pet-input"
                placeholder="e.g. Golden Retriever, Persian"
                value={formData.breed}
                onChange={handleChange}
              />
            </div>

            <div className="pet-form-group">
              <label htmlFor="pet-gender">
                <span>Gender</span>
                <span className="opt">Optional</span>
              </label>
              <select
                id="pet-gender"
                name="gender"
                className="pet-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pet-form-grid-2">
            <div className="pet-form-group">
              <label htmlFor="pet-dob">
                <span>Date of Birth</span>
                <span className="opt">Optional</span>
              </label>
              <PetDatePicker
                id="pet-dob"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                maxDate={todayStr}
                hasError={Boolean(fieldErrors.date_of_birth)}
              />
              {fieldErrors.date_of_birth && (
                <span className="field-error-msg">{fieldErrors.date_of_birth}</span>
              )}
            </div>

            <div className="pet-form-group">
              <label htmlFor="pet-weight">
                <span>Weight (kg)</span>
                <span className="opt">Optional</span>
              </label>
              <input
                id="pet-weight"
                name="weight"
                type="number"
                step="0.1"
                min="0"
                max="500"
                className={`pet-input ${fieldErrors.weight ? "input-error" : ""}`}
                placeholder="e.g. 14.5"
                value={formData.weight}
                onChange={handleChange}
              />
              {fieldErrors.weight && (
                <span className="field-error-msg">{fieldErrors.weight}</span>
              )}
            </div>
          </div>

          <div className="pet-form-group">
            <label htmlFor="pet-color">
              <span>Color / Markings</span>
              <span className="opt">Optional</span>
            </label>
            <input
              id="pet-color"
              name="color"
              type="text"
              className="pet-input"
              placeholder="e.g. Golden brown, White with black spots"
              value={formData.color}
              onChange={handleChange}
            />
          </div>

          {/* PHOTO / IMAGE */}
          <div className="pet-form-section-title">
            <ImageIcon size={14} />
            <span>Pet Photo</span>
          </div>

          <div className="pet-form-group">
            <label htmlFor="pet-photo">
              <span>Image URL</span>
              <span className="opt">Optional</span>
            </label>
            <input
              id="pet-photo"
              name="photo_url"
              type="url"
              className={`pet-input ${fieldErrors.photo_url ? "input-error" : ""}`}
              placeholder="https://example.com/pet-image.jpg"
              value={formData.photo_url}
              onChange={handleChange}
            />
            {fieldErrors.photo_url && (
              <span className="field-error-msg">{fieldErrors.photo_url}</span>
            )}

            {formData.photo_url && !imgLoadError && (
              <div className="pet-image-preview-box">
                <div className="pet-image-preview-thumb">
                  <img
                    src={formData.photo_url}
                    alt="Preview"
                    onError={() => setImgLoadError(true)}
                  />
                </div>
                <div className="pet-image-preview-info">
                  <strong>Photo preview active</strong>
                  <br />
                  Image successfully loaded.
                </div>
              </div>
            )}
            {formData.photo_url && imgLoadError && (
              <span className="field-error-msg">
                Unable to load preview from this URL. Please verify the link.
              </span>
            )}
          </div>

          {/* MEDICAL & HEALTH CARE */}
          <div className="pet-form-section-title">
            <span>Health & Medical Details</span>
          </div>

          <div className="pet-form-group">
            <label htmlFor="pet-allergies">
              <span>Allergies</span>
              <span className="opt">Optional</span>
            </label>
            <input
              id="pet-allergies"
              name="allergies"
              type="text"
              className="pet-input"
              placeholder="e.g. Chicken protein, Penicillin, Flea bites"
              value={formData.allergies}
              onChange={handleChange}
            />
          </div>

          <div className="pet-form-group">
            <label htmlFor="pet-medical">
              <span>Medical Conditions</span>
              <span className="opt">Optional</span>
            </label>
            <textarea
              id="pet-medical"
              name="medical_conditions"
              rows={2}
              className="pet-textarea"
              placeholder="e.g. Mild hip dysplasia, Asthma, Sensitive stomach"
              value={formData.medical_conditions}
              onChange={handleChange}
            />
          </div>

          {/* EMERGENCY INFO */}
          <div className="pet-form-section-title">
            <span>Emergency Information</span>
          </div>

          <div className="pet-form-group">
            <label htmlFor="pet-emergency">
              <span>Emergency Contact / Instructions</span>
              <span className="opt">Optional</span>
            </label>
            <textarea
              id="pet-emergency"
              name="emergency_information"
              rows={2}
              className="pet-textarea"
              placeholder="e.g. City Vet Clinic (+91 98765 43210), microchip #98514100"
              value={formData.emergency_information}
              onChange={handleChange}
            />
          </div>
        </form>

        {/* MODAL FOOTER */}
        <div className="pawlio-modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="pet-form"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="pet-spinner"></span>
                <span>{isEditing ? "Saving Changes..." : "Adding Pet..."}</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>{isEditing ? "Save Changes" : "Save Pet"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
