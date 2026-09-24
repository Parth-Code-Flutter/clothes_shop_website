"use client";

import { useEffect, useRef } from "react";

const MESSAGE = "Homepage preview — this action will be connected in a later phase.";

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-notice-title"
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-foreground shadow-lg"
      >
        <p id="preview-notice-title" className="text-lg font-semibold">
          {action}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">{MESSAGE}</p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Close
        </button>
      </div>
    </div>
  );
}
