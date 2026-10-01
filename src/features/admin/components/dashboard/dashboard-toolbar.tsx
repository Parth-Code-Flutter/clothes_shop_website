"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { Download } from "lucide-react";
import { buttonClass } from "@/features/admin/components/ui";
import { cn } from "@/lib/utils";

type Section = { id: string; label: string };

/** Offset below the sticky top bar and this toolbar where a section counts as "in view". */
const ACTIVE_LINE = 200;

export function DashboardToolbar({ sections, days, ranges }: { sections: Section[]; days: number; ranges: readonly number[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = sections[0]?.id;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= ACTIVE_LINE) current = section.id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections[sections.length - 1]?.id;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  function jump(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <div className="z-30 lg:sticky lg:top-16 lg:-mt-3 lg:bg-[linear-gradient(to_bottom,var(--adm-canvas)_70%,transparent)] lg:pt-3">
      <div className="adm-rise -mx-1 flex flex-col gap-2 rounded-xl border border-adm-line bg-adm-surface/85 p-1.5 shadow-[0_8px_24px_-16px_rgb(0_0_0/0.25)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Dashboard sections" className="-m-1 flex min-w-0 gap-1 overflow-x-auto p-1 [scrollbar-width:none]">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(event) => jump(event, section.id)}
              aria-current={active === section.id ? "location" : undefined}
              className={cn(
                "inline-flex h-8 shrink-0 items-center rounded-lg px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-adm-accent",
                active === section.id ? "bg-adm-accent-soft text-adm-accent" : "text-adm-ink-soft hover:bg-adm-surface-muted hover:text-adm-ink",
              )}
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <nav aria-label="Date range" className="inline-flex rounded-lg bg-adm-surface-muted p-0.5">
            {ranges.map((range) => (
              <Link
                key={range}
                href={range === 30 ? "/admin" : `/admin?range=${range}`}
                aria-current={range === days ? "page" : undefined}
                scroll={false}
                className={cn(
                  "inline-flex h-7 items-center rounded-md px-3 text-[12px] font-medium whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-adm-accent",
                  range === days ? "bg-adm-surface text-adm-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)]" : "text-adm-ink-faint hover:text-adm-ink",
                )}
              >
                {range} days
              </Link>
            ))}
          </nav>
          <a
            href={`/admin/analytics/export?range=${days}`}
            className={cn(buttonClass.secondary, "h-8 px-3")}
            title={`Download daily sales for the last ${days} days (CSV)`}
          >
            <Download className="size-3.5" strokeWidth={2} aria-hidden="true" />
            Export
          </a>
        </div>
      </div>
    </div>
  );
}
