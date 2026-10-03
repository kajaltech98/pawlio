import { PawPrint, ArrowRight, Pencil, Trash2, AlertTriangle, Calendar, Scale, Check } from "lucide-react";
import { calculatePetAge } from "../../lib/petService";

export default function PetCard({ pet, onView, onEdit, onDelete }) {
  const age = calculatePetAge(pet.date_of_birth);
  const photo = pet.photo_url || pet.image_url || pet.image;

  return (
    <article className="pet-card" aria-label={`Pet profile for ${pet.name}`}>
      {/* CARD TOP ROW: AVATAR & HEADER METADATA */}
      <div className="pet-card-header">
        <div className="pet-card-avatar-wrap">
          {photo ? (
            <img
              src={photo}
              alt={pet.name}
              className="pet-card-avatar-img"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="pet-card-avatar-fallback"
            style={{ display: photo ? "none" : "flex" }}
          >
            <PawPrint size={34} />
          </div>
        </div>

        <div className="pet-card-top-badges">
          {pet.species && (
            <span className="pet-card-species-badge">
              {pet.species.toUpperCase()}
            </span>
          )}
          <span className="pet-card-active-status" title="Pet profile is active">
            <Check size={12} strokeWidth={2.5} />
            <span>Active Profile</span>
          </span>
        </div>
      </div>

      {/* PET IDENTITY */}
      <div className="pet-card-identity">
        <h4 className="pet-card-name" title={pet.name}>
          {pet.name}
        </h4>
        <p className="pet-card-breed">
          {pet.breed || `${pet.species || "Pet"} · Breed unspecified`}
        </p>
      </div>

      {/* PET INFO CHIPS */}
      <div className="pet-card-chips">
        {pet.gender && (
          <span className="pet-chip" title={`Gender: ${pet.gender}`}>
            <span className="chip-symbol">{pet.gender.toLowerCase() === "female" ? "♀" : "♂"}</span>
            <span>{pet.gender}</span>
          </span>
        )}

        {age && (
          <span className="pet-chip" title={`Age: ${age}`}>
            <Calendar size={12} />
            <span>{age}</span>
          </span>
        )}

        {pet.weight !== null && pet.weight !== "" && pet.weight !== undefined && (
          <span className="pet-chip" title={`Weight: ${pet.weight} kg`}>
            <Scale size={12} />
            <span>{pet.weight} kg</span>
          </span>
        )}

        {pet.allergies && (
          <span className="pet-chip alert-chip" title={`Allergies: ${pet.allergies}`}>
            <AlertTriangle size={12} />
            <span>Allergies</span>
          </span>
        )}
      </div>

      {/* CARD ACTIONS */}
      <div className="pet-card-actions">
        <button
          type="button"
          className="pet-card-btn-view"
          onClick={() => onView(pet)}
          title={`View full profile of ${pet.name}`}
        >
          <span>View Profile</span>
          <ArrowRight size={14} />
        </button>

        <button
          type="button"
          className="pet-card-btn-icon"
          onClick={() => onEdit(pet)}
          title={`Edit ${pet.name}'s profile`}
          aria-label={`Edit ${pet.name}`}
        >
          <Pencil size={14} />
        </button>

        <button
          type="button"
          className="pet-card-btn-icon danger"
          onClick={() => onDelete(pet)}
          title={`Delete ${pet.name}'s profile`}
          aria-label={`Delete ${pet.name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  );
}
