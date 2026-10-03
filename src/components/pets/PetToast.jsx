import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export default function PetToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="pet-toast-container">
      <div className={`pet-toast ${isSuccess ? "toast-success" : "toast-error"}`} role="alert">
        <div className="pet-toast-icon">
          {isSuccess ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
        </div>
        <div className="pet-toast-content">{toast.message}</div>
        <button
          type="button"
          className="pet-toast-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
