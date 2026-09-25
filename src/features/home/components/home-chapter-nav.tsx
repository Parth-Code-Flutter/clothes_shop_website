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

    // Tall pinned chapters may never reach a useful intersection ratio.
    // Select the last chapter whose top crosses the reading line instead.
    let frame = 0;
    const update = () => {
      frame = 0;
      const readingLine = window.innerHeight * 0.4;
      let current = nodes[0].id;
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= readingLine) current = node.id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
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
          aria-current={active === chapter.id ? "location" : undefined}
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
