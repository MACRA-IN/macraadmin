import { useEffect } from "react";

const TONES = {
  primary: {
    iconWrap: "bg-[#2CD377]/10 text-[#2CD377]",
    confirm: "bg-[#2CD377] hover:bg-[#25b866] shadow-[#2CD377]/30",
  },
  danger: {
    iconWrap: "bg-red-50 text-red-500",
    confirm: "bg-red-500 hover:bg-red-600 shadow-red-500/30",
  },
};

const QuestionIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/**
 * In-app replacement for window.confirm(). Closes on Escape or backdrop click
 * unless a request is in flight.
 */
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  busyLabel = "Working...",
  busy = false,
  tone = "primary",
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  const styles = TONES[tone] || TONES.primary;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={() => !busy && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.iconWrap}`}
          >
            <QuestionIcon className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-gray-800">{title}</h2>

            {message && (
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{message}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
          <button
            onClick={onCancel}
            disabled={busy}
            className="min-w-0 flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            disabled={busy}
            className={`min-w-0 flex-1 rounded-xl py-2.5 text-sm font-bold text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${styles.confirm}`}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
