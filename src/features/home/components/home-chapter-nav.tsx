"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const CHAPTERS = [
  { id: "opener", label: "Opener" },
  { id: "look", label: "Look" },
  { id: "cast", label: "Cast" },
  { id: "media", label: "Media" },
  { id: "shop", label: "Shop" },
] as const;

/** Side chapter rail — theme-aware (not locked to white-on-black). */
export function HomeChapterNav() {
  const [active, setActive] = useState<string>("opener");

  useEffect(() => {
    const nodes = CHAPTERS.map((c) => document.getElementById(c.id)).filter(
      Boolean,
    ) as HTMLElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { threshold: [0.25, 0.45, 0.6], rootMargin: "-10% 0px -35% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Homepage chapters"
      className="pointer-events-none fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex xl:right-6"
    >
      {CHAPTERS.map((chapter, index) => (
        <a
          key={chapter.id}
          href={`#${chapter.id}`}
          className={cn(
            "pointer-events-auto group flex items-center justify-end gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
            active === chapter.id
              ? "text-accent"
              : "text-muted hover:text-foreground",
          )}
        >
          <span className="rounded-md bg-background/80 px-2 py-1 text-[9px] font-semibold tracking-[0.2em] uppercase opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {chapter.label}
          </span>
          <span className="font-mono text-[10px] tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className={cn(
              "block h-8 w-px transition-all",
              active === chapter.id ? "bg-accent scale-y-100" : "bg-border",
            )}
            aria-hidden="true"
          />
        </a>
      ))}
    </nav>
  );
}
