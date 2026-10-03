import { useEffect } from "react";
import { AlertTriangle, Trash2, PawPrint } from "lucide-react";

export default function DeletePetModal({
  isOpen,
  pet,
  onClose,
  onConfirm,
  isDeleting,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !pet) return null;

  const photo = pet.photo_url || pet.image_url || pet.image;

  return (
    <div className="pawlio-modal-overlay" onClick={onClose}>
      <div
        className="pawlio-modal"
        style={{ maxWidth: 440 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pawlio-modal-body" style={{ padding: "28px 24px" }}>
          <div className="delete-confirm-box">
            <div className="delete-warning-icon">
              <AlertTriangle size={30} />
            </div>

            <h3>Delete {pet.name}?</h3>

            <div className="delete-pet-preview">
              {photo ? (
                <img
                  src={photo}
                  alt={pet.name}
                  style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <PawPrint size={18} color="var(--primary)" />
              )}
              <span>
                {pet.name} ({pet.species})
              </span>
            </div>

            <p>
              Are you sure you want to delete <strong>{pet.name}</strong>'s profile?
              This will permanently remove this pet and cannot be undone.
            </p>
          </div>
        </div>

        <div className="pawlio-modal-footer" style={{ justifyContent: "center", gap: 14 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
            style={{ minWidth: 110 }}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn-danger"
            onClick={() => onConfirm(pet)}
            disabled={isDeleting}
            style={{ minWidth: 130 }}
          >
            {isDeleting ? (
              <>
                <span className="pet-spinner"></span>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>Delete Pet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
