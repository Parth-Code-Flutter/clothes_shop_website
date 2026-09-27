"use client";

import Image from "next/image";
import { useState, type FocusEvent, type PointerEvent, type ReactNode } from "react";
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
  children?: ReactNode;
};

/**
 * Product photo that turns into a small scene on hover: the next angle drops in
 * like a stage curtain, a soft spotlight follows the cursor, and a strip shows
 * how many angles there are. With three or more angles the cursor position
 * scrubs between them. Touch devices keep the resting photo; keyboard focus
 * reveals the second angle.
 */
export function ProductMedia({ images, alt, sizes, className, imageClassName, showViewLabel = true, children }: ProductMediaProps) {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  // Extra angles load on first intent, so grids only fetch the resting photo up front.
  const [armed, setArmed] = useState(false);
  const count = images.length;

  const aim = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 0.999);
    const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
    event.currentTarget.style.setProperty("--spot-x", `${(x * 100).toFixed(1)}%`);
    event.currentTarget.style.setProperty("--spot-y", `${(y * 100).toFixed(1)}%`);
    if (count > 1) setActive(1 + Math.floor(x * (count - 1)));
  };

  const enter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    setArmed(true);
    setHovering(true);
    aim(event);
  };

  const leave = () => {
    setHovering(false);
    setActive(0);
  };

  const focus = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.target.matches(":focus-visible")) return;
    setArmed(true);
    setActive(count > 1 ? 1 : 0);
  };

  const blur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActive(0);
  };

  const showing = hovering || active > 0;

  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
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
    </div>
  );
}
