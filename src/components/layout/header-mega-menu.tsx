"use client";

import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { useReducedMotion } from "motion/react";
import Magnet from "@/components/react-bits/Magnet";
import { getAllProducts } from "@/features/catalog/data";
import { getMensSubLinks } from "@/config/navigation";
import { formatInrFromPaise } from "@/lib/money";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

type HeaderMegaMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overHero: boolean;
  onNavigate?: () => void;
};

export function HeaderMegaMenu({
  open,
  onOpenChange,
  overHero,
  onNavigate,
}: HeaderMegaMenuProps) {
  const reduceMotion = useReducedMotion();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const subs = getMensSubLinks();
  const featured = getAllProducts()[0];

  useGSAP(
    () => {
      const panel = panelRef.current;
      const items = itemsRef.current;
      if (!panel || !items) return;

      const rows = items.querySelectorAll<HTMLElement>("[data-mega-item]");

      if (reduceMotion) {
        gsap.set(panel, { height: open ? "auto" : 0, autoAlpha: open ? 1 : 0 });
        gsap.set(rows, { clearProps: "all" });
        return;
      }

      if (open) {
        gsap.set(panel, { height: "auto", autoAlpha: 1, overflow: "hidden" });
        const height = panel.offsetHeight;
        gsap.fromTo(
          panel,
          { height: 0, autoAlpha: 0 },
          {
            height,
            autoAlpha: 1,
            duration: 0.45,
            ease: "power3.out",
            onComplete: () => {
              gsap.set(panel, { height: "auto", overflow: "visible" });
            },
          },
        );
        gsap.fromTo(
          rows,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.045,
            ease: "power3.out",
            delay: 0.08,
          },
        );
      } else {
        gsap.to(rows, {
          opacity: 0,
          y: 8,
          duration: 0.18,
          stagger: 0.02,
          ease: "power2.in",
        });
        gsap.to(panel, {
          height: 0,
          autoAlpha: 0,
          duration: 0.32,
          ease: "power2.inOut",
          delay: 0.05,
          overflow: "hidden",
        });
      }
    },
    { dependencies: [open, reduceMotion], scope: panelRef },
  );

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    }

    function onPointer(event: MouseEvent) {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      onOpenChange(false);
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, onOpenChange]);

  return (
    <div className="relative hidden lg:block">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
        onMouseEnter={() => onOpenChange(true)}
        className={cn(
          "group inline-flex items-center gap-1.5 py-2 text-[11px] font-semibold tracking-[0.16em] uppercase focus-visible:outline-2 focus-visible:outline-offset-4",
          overHero
            ? "text-white/75 hover:text-white focus-visible:outline-white"
            : open
              ? "text-foreground focus-visible:outline-foreground"
              : "text-muted hover:text-foreground focus-visible:outline-foreground",
        )}
      >
        Mens
        <ChevronDown
          size={14}
          className={cn(
            "transition-transform duration-300 motion-reduce:transition-none",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent transition-transform duration-300",
            open ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
          )}
          aria-hidden="true"
        />
      </button>

      <div
        id={panelId}
        ref={panelRef}
        role="region"
        aria-label="Mens categories"
        className="absolute top-full left-0 z-50 w-[min(92vw,640px)] -translate-x-2 overflow-hidden opacity-0"
        onMouseLeave={() => onOpenChange(false)}
      >
        <div
          ref={itemsRef}
          className="mt-3 overflow-hidden rounded-2xl border border-border bg-background/95 text-foreground shadow-[0_24px_60px_rgba(19,6,3,0.18)] backdrop-blur-2xl"
        >
          <div className="grid gap-0 sm:grid-cols-[1.1fr_0.9fr]">
            <div className="border-b border-border p-5 sm:border-r sm:border-b-0 sm:p-6">
              <p
                data-mega-item
                className="mb-4 text-[10px] font-semibold tracking-[0.22em] text-muted uppercase"
              >
                Mens wardrobe
              </p>
              <ul className="space-y-1">
                {subs.map((sub, index) => (
                  <li key={sub.href} data-mega-item>
                    <Link
                      href={sub.href}
                      onClick={() => {
                        onOpenChange(false);
                        onNavigate?.();
                      }}
                      className="group flex min-h-12 items-start justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    >
                      <span>
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-muted tabular-nums">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="text-sm font-semibold tracking-tight">
                            {sub.label}
                          </span>
                          {!sub.available ? (
                            <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[9px] font-semibold tracking-[0.14em] text-muted uppercase">
                              Soon
                            </span>
                          ) : (
                            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-semibold tracking-[0.14em] text-accent uppercase">
                              Live
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block pl-7 text-xs leading-5 text-muted">
                          {sub.description}
                        </span>
                      </span>
                      <ArrowUpRight
                        size={16}
                        className="mt-1 shrink-0 text-muted transition-colors group-hover:text-accent"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              <div data-mega-item className="mt-4 border-t border-border pt-4">
                <Magnet
                  padding={28}
                  magnetStrength={4}
                  disabled={!!reduceMotion}
                >
                  <Link
                    href="/shop"
                    onClick={() => {
                      onOpenChange(false);
                      onNavigate?.();
                    }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold tracking-[0.14em] text-background uppercase transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                  >
                    Shop all mens
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                </Magnet>
              </div>
            </div>

            {featured ? (
              <Link
                href={`/product/${featured.slug}`}
                data-mega-item
                onClick={() => {
                  onOpenChange(false);
                  onNavigate?.();
                }}
                className="group relative min-h-[220px] overflow-hidden bg-[#0a0705] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
              >
                <Image
                  src={featured.image}
                  alt={featured.alt}
                  fill
                  sizes="280px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-accent uppercase">
                    Featured drop
                  </p>
                  <p className="mt-1 font-display text-2xl tracking-wide">
                    {featured.name}
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    {formatInrFromPaise(featured.pricePaise)}
                  </p>
                </div>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
