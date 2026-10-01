"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function AdminThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg border border-adm-line bg-adm-surface text-adm-ink-soft transition-colors hover:border-adm-line-strong hover:text-adm-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adm-accent",
        className,
      )}
    >
      {isDark ? <Sun className="size-[18px]" strokeWidth={1.6} /> : <Moon className="size-[18px]" strokeWidth={1.6} />}
    </button>
  );
}
