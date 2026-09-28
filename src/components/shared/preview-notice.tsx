"use client";

import { useEffect, useRef } from "react";
import styles from "./preview-notice.module.css";

const MESSAGE = "Payment preview — the live Razorpay checkout connects in the next phase. No charge has been made.";

export function PreviewNotice({
  open,
  action,
  onClose,
}: {
  open: boolean;
  action: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-notice-title"
        aria-describedby="preview-notice-message"
        className={styles.card}
      >
        <p className={styles.eyebrow}>Preview</p>
        <p id="preview-notice-title" className={styles.title}>
          {action}
        </p>
        <p id="preview-notice-message" className={styles.message}>{MESSAGE}</p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className={`${styles.close} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent`}
        >
          Close
        </button>
      </div>
    </div>
  );
}
