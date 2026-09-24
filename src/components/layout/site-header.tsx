"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingBag, User, X, Heart } from "lucide-react";
import { useState } from "react";
import { PreviewNotice } from "@/components/shared/preview-notice";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const ACTIONS = [
  { id: "search", label: "Search", icon: Search },
  { id: "account", label: "Account", icon: User },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "cart", label: "Cart", icon: ShoppingBag },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  function openPreview(label: string) {
    setMenuOpen(false);
    setPreview(label);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="flex h-16 items-center gap-3 px-4 sm:h-20 sm:px-6 lg:px-10">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
        </button>

        <Link href="/" className="mr-auto inline-flex">
          <Image
            src="/brand/house-of-bollywood-logo.png"
            alt="House of Bollywood"
            width={1024}
            height={341}
            priority
            className="h-9 w-auto sm:h-11"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          <button
            type="button"
            onClick={() => openPreview("Shop")}
            className="text-sm font-medium tracking-[0.18em] text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Shop
          </button>
        </nav>

        <div className="ml-auto hidden items-center gap-1 lg:ml-8 lg:flex">
          {ACTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              onClick={() => openPreview(label)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Icon aria-hidden="true" className="size-5" />
            </button>
          ))}
          <ThemeToggle />
        </div>
        <div className="ml-auto flex items-center lg:hidden">
          <ThemeToggle />
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="flex flex-col border-t border-border bg-background px-4 py-4 lg:hidden"
        >
          <button
            type="button"
            onClick={() => openPreview("Shop")}
            className="flex h-12 w-full items-center text-left text-2xl font-semibold tracking-tight text-foreground"
          >
            Shop
          </button>
          {ACTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => openPreview(label)}
              className="flex h-12 w-full items-center text-left text-lg text-foreground"
            >
              {label}
            </button>
          ))}
        </nav>
      ) : null}

      <PreviewNotice
        open={preview !== null}
        action={preview ?? ""}
        onClose={() => setPreview(null)}
      />
    </header>
  );
}
