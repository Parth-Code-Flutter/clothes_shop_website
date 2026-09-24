import Image from "next/image";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3 sm:px-6">
      <span className="inline-flex rounded-md bg-[#fbf7f2] px-2 py-1">
        <Image
          src="/brand/house-of-bollywood-logo.jpg"
          alt="House of Bollywood"
          width={1024}
          height={341}
          priority
          className="h-10 w-auto sm:h-12"
        />
      </span>
      <ThemeToggle />
    </header>
  );
}
