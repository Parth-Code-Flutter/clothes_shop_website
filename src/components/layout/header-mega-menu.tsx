"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useRef } from "react";
import { clothingGroups } from "@/config/navigation";

type HeaderMegaMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Men navigation with mouse, keyboard, and touch-friendly disclosure behaviour. */
export function HeaderMegaMenu({ open, onOpenChange }: HeaderMegaMenuProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => onOpenChange(false), 180);
  }, [cancelClose, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      cancelClose();
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [cancelClose, open, onOpenChange]);

  return (
    <div
      ref={root}
      onMouseEnter={() => {
        cancelClose();
        onOpenChange(true);
      }}
      onMouseLeave={scheduleClose}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onOpenChange(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => onOpenChange(true)}
        className="group relative flex min-h-11 items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        Men
        <ChevronDown size={13} aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`} />
        <span className={`absolute bottom-0 h-0.5 bg-accent transition-all ${open ? "w-10" : "w-0 group-hover:w-10"}`} aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={id}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="fixed inset-x-0 top-[75px] border-y border-border bg-background text-foreground shadow-[0_24px_50px_rgb(0_0_0/0.14)]"
        >
          <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-8 py-8 xl:px-12">
            <Link href="/shop" onClick={() => onOpenChange(false)} className="group relative col-span-4 min-h-[330px] overflow-hidden bg-footer text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              <Image src="/images/catalog/jacket-suede.jpg" alt="Black leather jacket" fill sizes="33vw" className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/5" aria-hidden="true" />
              <span className="absolute inset-x-0 bottom-0 p-7">
                <span className="text-[9px] font-bold tracking-[0.25em] text-white/65 uppercase">The men&apos;s edit</span>
                <span className="mt-3 block font-display text-5xl leading-[0.88] tracking-wide">Dress for<br />the entrance.</span>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold tracking-[0.12em] uppercase">Shop all men <ArrowUpRight size={15} aria-hidden="true" /></span>
              </span>
            </Link>

            <div className="col-span-4 border-r border-border pr-8">
              <div className="flex items-end justify-between border-b border-border pb-4">
                <div>
                  <p className="text-[9px] font-bold tracking-[0.25em] text-accent uppercase">Wardrobe</p>
                  <p className="mt-1 font-display text-3xl tracking-wide">Shop clothing</p>
                </div>
                <span className="font-mono text-[10px] text-muted">01—05</span>
              </div>
              <ul className="mt-2">
                {clothingGroups.map((group, index) => (
                  <li key={group.label} className="border-b border-border/70">
                    <Link href={group.href} onClick={() => onOpenChange(false)} className="group/link flex min-h-12 items-center justify-between text-sm font-semibold hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                      <span><span className="mr-4 font-mono text-[9px] text-muted">0{index + 1}</span>{group.label}</span>
                      <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover/link:translate-x-1 motion-reduce:transition-none" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[9px] font-bold tracking-[0.25em] text-accent uppercase">Quick direction</p>
                  <p className="mt-1 font-display text-3xl tracking-wide">Start here</p>
                </div>
                <Link href="/shop" onClick={() => onOpenChange(false)} className="text-xs font-semibold underline decoration-accent underline-offset-4">View all</Link>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <MenuEdit image="/images/catalog/tee-white.jpg" label="Everyday layers" href="/shop?category=t-shirts" onClick={() => onOpenChange(false)} />
                <MenuEdit image="/images/catalog/jean-wash.jpg" label="Denim rotation" href="/shop?category=jeans" onClick={() => onOpenChange(false)} />
              </div>
              <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted">Explore the full wardrobe or jump directly into the category you came for.</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuEdit({ image, label, href, onClick }: { image: string; label: string; href: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
      <span className="relative block aspect-[4/5] overflow-hidden bg-surface">
        <Image src={image} alt="" fill sizes="15vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
      </span>
      <span className="mt-2 flex items-center justify-between text-xs font-semibold">{label}<ArrowUpRight size={13} aria-hidden="true" /></span>
    </Link>
  );
}
