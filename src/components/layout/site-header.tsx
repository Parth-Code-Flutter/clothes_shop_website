"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useCart } from "@/features/cart/cart-provider";
import { useWishlist } from "@/features/wishlist/wishlist-provider";
import { cn } from "@/lib/utils";

/**
 * Inspiration (Dribbble + Pinterest):
 * - Centered logo + left text nav + right utilities (Pinterest fashion headers)
 * - One accent color only on the Bag CTA (streetwear systems like GRYM)
 * - Full-bleed editorial mobile menu with index numbers (Dribbble apparel shots)
 */

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/search", label: "Search" },
] as const;

const mobileLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop all" },
  { href: "/search", label: "Search" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account", label: "Account" },
  { href: "/cart", label: "Bag" },
] as const;

const iconBtn =
  "relative inline-flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { count } = useWishlist();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const menuOpen = openPath === pathname;
  const menuButton = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className="sticky top-0 z-40 bg-background/90 text-foreground backdrop-blur-xl"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setOpenPath(null);
          menuButton.current?.focus();
        }
      }}
    >
      {/* Accent period bar — brand red as the only chrome (LUNCH / GRYM idea) */}
      <div className="h-1 w-full bg-accent" aria-hidden="true" />

      <div className="border-b border-border">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-2 text-[10px] font-semibold tracking-[0.2em] uppercase sm:px-8">
          <span className="flex items-center gap-2">
            <span
              className="relative flex size-2 items-center justify-center"
              aria-hidden="true"
            >
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent/40 motion-reduce:animate-none" />
              <span className="relative size-1.5 rounded-full bg-accent" />
            </span>
            Now showing · Graphic tees
          </span>
          <span className="hidden text-muted sm:inline">Junagadh, India</span>
        </div>
      </div>

      <div className="relative mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:h-[88px] sm:px-8">
        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center gap-8 lg:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "group relative py-2 text-[11px] font-semibold tracking-[0.18em] uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground",
                isActive(link.href) ? "text-foreground" : "text-muted hover:text-foreground",
              )}
            >
              {link.label}
              <span
                className={cn(
                  "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent transition-transform duration-300 motion-reduce:transition-none",
                  isActive(link.href)
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100",
                )}
                aria-hidden="true"
              />
            </Link>
          ))}
        </nav>

        <button
          ref={menuButton}
          type="button"
          className={cn(iconBtn, "lg:hidden")}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setOpenPath(menuOpen ? null : pathname)}
        >
          {menuOpen ? (
            <X size={22} aria-hidden="true" />
          ) : (
            <Menu size={22} aria-hidden="true" />
          )}
        </button>

        <Link
          href="/"
          aria-label="House of Bollywood home"
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white px-2.5 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        >
          <Image
            src="/brand/house-of-bollywood-logo.png"
            alt="House of Bollywood"
            width={1024}
            height={341}
            priority
            className="h-auto w-[120px] sm:w-[168px]"
          />
        </Link>

        <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className={cn(iconBtn, "hidden sm:inline-flex")}
          >
            <Search size={18} aria-hidden="true" />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className={cn(iconBtn, "hidden lg:inline-flex")}
          >
            <User size={18} aria-hidden="true" />
          </Link>
          <Link
            href="/wishlist"
            aria-label={count > 0 ? `Wishlist, ${count} saved` : "Wishlist"}
            className={cn(iconBtn, "hidden lg:inline-flex")}
          >
            <Heart size={18} aria-hidden="true" />
            {count > 0 ? (
              <span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground">
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </Link>
          <ThemeToggle />
          <Link
            href="/cart"
            aria-label={
              itemCount > 0 ? `Bag, ${itemCount} items` : "Bag"
            }
            className="ml-1 inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-accent px-3.5 text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:px-4"
          >
            <ShoppingBag size={17} aria-hidden="true" />
            <span className="hidden text-[11px] font-semibold tracking-[0.14em] uppercase sm:inline">
              Bag
            </span>
            <span className="min-w-[1.1ch] text-xs font-semibold tabular-nums">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          </Link>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="max-h-[calc(100dvh-120px)] overflow-y-auto border-t border-border bg-background lg:hidden"
        >
          <div className="px-6 pt-6 pb-2">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-muted uppercase">
              Enter the house
            </p>
          </div>
          <ul className="px-6 pb-8">
            {mobileLinks.map((link, index) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpenPath(null)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className="group flex min-h-16 items-center gap-4 border-b border-border py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  <span className="w-8 font-mono text-[11px] tabular-nums text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">
                    {link.label}
                    {link.href === "/cart" && itemCount > 0
                      ? ` (${itemCount})`
                      : ""}
                    {link.href === "/wishlist" && count > 0
                      ? ` (${count})`
                      : ""}
                  </span>
                  <ArrowUpRight
                    size={20}
                    className="ml-auto text-muted transition-colors group-hover:text-accent"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
