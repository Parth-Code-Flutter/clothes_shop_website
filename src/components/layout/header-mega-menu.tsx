"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { clothingGroups } from "@/config/navigation";

export function HeaderMegaMenu({ open, onOpenChange }: {
  open: boolean; onOpenChange: (open: boolean) => void;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onOpenChange(false); trigger.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={root} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onOpenChange(false);
    }}>
      <button ref={trigger} type="button" aria-expanded={open} aria-controls={id}
        onClick={() => onOpenChange(!open)}
        className="flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] focus-visible:outline-2 focus-visible:outline-offset-4">
        Clothing <ChevronDown size={14} aria-hidden="true" className={open ? "rotate-180" : ""} />
      </button>
      {open && (
        <div id={id} className="absolute inset-x-0 top-full border-y border-border bg-background shadow-xl">
          <div className="mx-auto max-w-[1440px] px-8 py-8">
            <div className="mb-7 flex items-center justify-between gap-6">
              <p className="font-display text-3xl tracking-wide">Find your next fit.</p>
              <Link href="/shop" onClick={() => onOpenChange(false)} className="flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4">Shop all clothing <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
            <div className="grid grid-cols-4 gap-8">
              {clothingGroups.map((group, index) => (
                <section key={group.label} aria-label={group.label} className="border-t border-border pt-4">
                  <h2 className="mb-3 flex items-center justify-between text-base font-semibold">{group.label}<span aria-hidden="true" className="font-mono text-xs text-muted">0{index + 1}</span></h2>
                  <ul>{group.items.map((item) => (
                    <li key={item.label}>
                      {item.href ? <Link href={item.href} onClick={() => onOpenChange(false)} className="flex min-h-11 items-center justify-between text-sm underline-offset-4 hover:underline focus-visible:outline-2">{item.label}<ArrowUpRight size={14} aria-hidden="true" /></Link>
                        : <span className="flex min-h-11 items-center justify-between gap-2 text-sm text-muted">{item.label}<span className="text-[9px] uppercase tracking-wider">Preview</span></span>}
                    </li>
                  ))}</ul>
                </section>
              ))}
            </div>
            <p className="mt-6 border-t border-border pt-4 text-xs text-muted">Preview categories show the proposed range. Graphic tees are available to browse now.</p>
          </div>
        </div>
      )}
    </div>
  );
}
