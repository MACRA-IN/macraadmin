import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Small toast queue-of-one. Replaces window.alert() for success / error feedback.
 * Returns the active toast plus helpers to raise and dismiss it.
 */
const useToast = (duration = 4000) => {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const dismiss = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback(
    (type, message) => {
      if (!message) return;
      clearTimeout(timer.current);
      setToast({ type, message, id: Date.now() });
      timer.current = setTimeout(() => setToast(null), duration);
    },
    [duration],
  );

  const showSuccess = useCallback((message) => show("success", message), [show]);
  const showError = useCallback((message) => show("error", message), [show]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, showSuccess, showError, dismiss };
};

export default useToast;
