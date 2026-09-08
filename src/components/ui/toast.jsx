const SuccessIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TONES = {
  success: {
    icon: SuccessIcon,
    iconWrap: "bg-[#2CD377]/15 text-[#2CD377]",
    accent: "bg-[#2CD377]",
  },
  error: {
    icon: ErrorIcon,
    iconWrap: "bg-red-50 text-red-500",
    accent: "bg-red-500",
  },
};

/**
 * Bottom-centred on mobile (clears the sticky bottom nav), bottom-right on desktop.
 */
const Toast = ({ toast, onDismiss }) => {
  if (!toast) return null;

  const tone = TONES[toast.type] || TONES.success;
  const Icon = tone.icon;

  return (
    <div className="fixed bottom-24 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 md:bottom-6 md:left-auto md:right-6 md:translate-x-0">
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 overflow-hidden rounded-2xl border border-gray-100 bg-white pr-2 shadow-lg"
      >
        <span className={`h-full w-1 self-stretch shrink-0 ${tone.accent}`} />

        <span
          className={`my-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone.iconWrap}`}
        >
          <Icon className="h-4 w-4" />
        </span>

        <p className="min-w-0 flex-1 py-3 text-sm font-semibold text-gray-800">
          {toast.message}
        </p>

        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-lg p-2 text-gray-300 transition-colors hover:text-gray-500 cursor-pointer"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
