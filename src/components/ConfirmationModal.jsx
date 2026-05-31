import { TriangleAlert } from "lucide-react";

/**
 * Minimal confirmation modal — no DaisyUI dependencies.
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  message = "Are you sure you want to proceed?",
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-up">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-base-100 border border-base-300/80 w-full max-w-sm rounded-2xl shadow-2xl p-6 z-10">
        {/* Icon + title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="size-8 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
            <TriangleAlert className="size-4 text-error" />
          </div>
          <h3 className="font-semibold text-base">{title}</h3>
        </div>

        <p className="text-sm text-base-content/60 leading-relaxed mb-6 pl-11">
          {message}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-base-content/60 hover:text-base-content hover:bg-base-200 transition-all duration-150 press"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-error text-error-content hover:brightness-105 transition-all duration-150 press disabled:opacity-50"
          >
            {isLoading ? "…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
