import { useEffect } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { formatCalendarDate } from "../../lib/dateUtils";

export default function DeleteHealthRecordModal({
  isOpen,
  record,
  petName = "your pet",
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !record) return null;

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

            <h3>Delete Health Record?</h3>

            <div className="delete-pet-preview" style={{ flexDirection: "column", gap: 3 }}>
              <strong style={{ color: "var(--dark)" }}>{record.title}</strong>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                {petName} · {record.record_type} · {formatCalendarDate(record.record_date)}
              </span>
            </div>

            <p style={{ marginTop: "12px", color: "var(--text)", fontSize: "14px", lineHeight: 1.5 }}>
              Are you sure you want to delete this health record?
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
            onClick={() => onConfirm(record)}
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
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
