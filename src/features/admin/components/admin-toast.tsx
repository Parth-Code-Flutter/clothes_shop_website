"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastTone = "success" | "info" | "error";
type Toast = { id: number; tone: ToastTone; message: string };

const TONE = {
  success: { icon: CheckCircle2, className: "text-adm-success" },
  info: { icon: Info, className: "text-adm-info" },
  error: { icon: TriangleAlert, className: "text-adm-danger" },
};

/** Returns a toast element to render once, and a function to show a message in it. */
export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((message: string, tone: ToastTone = "success") => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), tone, message });
    timer.current = window.setTimeout(() => setToast(null), 5000);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const meta = toast ? TONE[toast.tone] : null;
  const element = (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex justify-center px-4">
      {toast && meta ? (
        <div
          key={toast.id}
          role="status"
          className="adm-rise pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border border-adm-line bg-adm-surface py-3 pr-2 pl-3.5 text-[13px] text-adm-ink shadow-[0_18px_50px_-18px_rgb(0_0_0/0.45)]"
        >
          <meta.icon className={cn("mt-0.5 size-4 shrink-0", meta.className)} strokeWidth={2} aria-hidden="true" />
          <p className="leading-snug">{toast.message}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss"
            className="-my-1 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-adm-ink-faint hover:bg-adm-surface-muted hover:text-adm-ink"
          >
            <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );

  return [element, show] as const;
}
