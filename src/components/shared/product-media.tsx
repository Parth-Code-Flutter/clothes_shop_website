"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, type FocusEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const VIEW_LABELS: Record<string, string> = { front: "Front", back: "Back", alt: "Angle", detail: "Detail" };

function viewLabel(src: string, index: number) {
  const name = src.split("/").pop()?.replace(/\.\w+$/, "") ?? "";
  return VIEW_LABELS[name] ?? `View ${index + 1}`;
}

type ProductMediaProps = {
  images: string[];
  alt: string;
  sizes: string;
  className?: string;
  /** Extra classes for the first (resting) photo, e.g. a hover zoom. */
  imageClassName?: string;
  /** Shows the "02/02 · Back" chip; turn off where the corner is already used. */
  showViewLabel?: boolean;
  /** Where the previous/next pill sits; defaults to the bottom-right corner, level with the rating chip. */
  navClassName?: string;
  children?: ReactNode;
};

/**
 * Product photo that turns into a small scene on hover: the next angle drops in
 * like a stage curtain, a soft spotlight follows the cursor, and a strip shows
 * how many angles there are. With three or more angles the cursor position
 * scrubs between them. Previous/next arrows step through the same angles on any
 * device; once used, the shopper's pick stays put instead of following the cursor.
 */
export function ProductMedia({ images, alt, sizes, className, imageClassName, showViewLabel = true, navClassName = "right-2 bottom-2", children }: ProductMediaProps) {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [picked, setPicked] = useState(false);
  // Extra angles load on first intent, so grids only fetch the resting photo up front.
  const [armed, setArmed] = useState(false);
  const count = images.length;

  const aim = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 0.999);
    const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
    event.currentTarget.style.setProperty("--spot-x", `${(x * 100).toFixed(1)}%`);
    event.currentTarget.style.setProperty("--spot-y", `${(y * 100).toFixed(1)}%`);
    if (count > 1 && !picked) setActive(1 + Math.floor(x * (count - 1)));
  };

  const enter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    setArmed(true);
    setHovering(true);
    aim(event);
  };

  const leave = () => {
    setHovering(false);
    if (!picked) setActive(0);
  };

  const focus = (event: FocusEvent<HTMLDivElement>) => {
    setArmed(true);
    if (picked || !event.target.matches(":focus-visible") || event.target.closest("[data-media-nav]")) return;
    setActive(count > 1 ? 1 : 0);
  };

  const blur = (event: FocusEvent<HTMLDivElement>) => {
    if (!picked && !event.currentTarget.contains(event.relatedTarget as Node | null)) setActive(0);
  };

  const step = (event: MouseEvent<HTMLButtonElement>, direction: 1 | -1) => {
    event.preventDefault();
    event.stopPropagation();
    const next = (active + direction + count) % count;
    setPicked(true);
    if (armed) {
      setActive(next);
      return;
    }
    // Mount the hidden angles first so the curtain animates in rather than popping.
    setArmed(true);
    window.setTimeout(() => setActive(next), 40);
  };

  const showing = hovering || active > 0;
  const navButtonClass =
    "inline-flex h-full w-6 items-center justify-center transition-colors hover:bg-foreground hover:text-background active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground";

  return (
    <div
      className={cn("group/media relative isolate overflow-hidden", className)}
      onPointerEnter={enter}
      onPointerMove={(event) => event.pointerType === "mouse" && aim(event)}
      onPointerLeave={leave}
      onFocus={focus}
      onBlur={blur}
    >
      {images.map((src, index) =>
        index === 0 || armed ? (
          <Image
            key={src}
            src={src}
            alt={index === 0 ? alt : ""}
            fill
            sizes={sizes}
            style={index === 0 ? undefined : { clipPath: index <= active ? "inset(0 0 0 0)" : "inset(0 0 100% 0)", transform: index <= active ? "scale(1)" : "scale(1.08)" }}
            className={cn(
              "object-cover object-center",
              index === 0
                ? imageClassName
                : "transition-[clip-path,transform] duration-700 ease-[cubic-bezier(0.77,0,0.18,1)] motion-reduce:transition-none",
            )}
          />
        ) : null,
      )}

      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 motion-reduce:hidden",
          hovering && "opacity-100",
        )}
        style={{
          background:
            "radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 40%), rgb(255 255 255 / 0.18), transparent 30%), radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 40%), transparent 35%, rgb(0 0 0 / 0.3))",
        }}
      />

      {count > 1 ? (
        <>
          <span
            aria-hidden="true"
            className={cn("pointer-events-none absolute inset-x-0 top-0 flex h-[3px] gap-px bg-black/20 opacity-0 transition-opacity duration-300", showing && "opacity-100")}
          >
            {images.map((src, index) => (
              <span key={src} className={cn("flex-1 transition-colors duration-300", index === active ? "bg-accent" : "bg-white/55")} />
            ))}
          </span>
          {showViewLabel ? (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute top-3 left-2 -translate-x-1 bg-background/90 px-1.5 py-1 font-mono text-[9px] tracking-[0.08em] text-foreground uppercase opacity-0 shadow-sm transition-all duration-300 motion-reduce:translate-x-0",
                showing && "translate-x-0 opacity-100",
              )}
            >
              {String(active + 1).padStart(2, "0")}/{String(count).padStart(2, "0")} · {viewLabel(images[active], active)}
            </span>
          ) : null}
        </>
      ) : null}

      {children}

      {count > 1 ? (
        // Hover-only on mouse devices; touch screens have no hover, so the pill stays visible there.
        <div
          data-media-nav
          className={cn(
            "absolute z-10 flex h-[23px] items-center bg-background/90 text-foreground shadow-sm transition-[opacity,transform] duration-300 [@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within/media:pointer-events-auto [@media(hover:hover)]:group-focus-within/media:translate-y-0 [@media(hover:hover)]:group-focus-within/media:opacity-100 [@media(hover:hover)]:group-hover/media:pointer-events-auto [@media(hover:hover)]:group-hover/media:translate-y-0 [@media(hover:hover)]:group-hover/media:opacity-100",
            navClassName,
          )}
        >
          <button type="button" onPointerDown={() => setArmed(true)} onClick={(event) => step(event, -1)} aria-label={`Previous photo, ${viewLabel(images[(active - 1 + count) % count], (active - 1 + count) % count)}`} className={navButtonClass}>
            <ChevronLeft className="size-3.5" aria-hidden="true" />
          </button>
          <span className="min-w-7 text-center text-[10px] font-bold tabular-nums" aria-hidden="true">{active + 1}/{count}</span>
          <button type="button" onPointerDown={() => setArmed(true)} onClick={(event) => step(event, 1)} aria-label={`Next photo, ${viewLabel(images[(active + 1) % count], (active + 1) % count)}`} className={navButtonClass}>
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
