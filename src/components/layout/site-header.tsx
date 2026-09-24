"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import Magnet from "@/components/react-bits/Magnet";
import { HeaderMegaMenu } from "@/components/layout/header-mega-menu";
import { useSmoothScroll } from "@/components/motion/smooth-scroll";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getMensSubLinks } from "@/config/navigation";
import { useCart } from "@/features/cart/cart-provider";
import { useWishlist } from "@/features/wishlist/wishlist-provider";
import { cn } from "@/lib/utils";

/**
 * Premium editorial header — single sticky row, theme tokens always.
 * Mens mega menu kept; no ticker strip / frosted blue glass.
 */

const iconBtn =
  "relative inline-flex size-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

const navLink =
  "relative py-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground";

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { count } = useWishlist();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [mensOpen, setMensOpen] = useState(false);
  const [mobileMensOpen, setMobileMensOpen] = useState(false);
  const menuOpen = openPath === pathname;
  const menuButton = useRef<HTMLButtonElement>(null);
  const { stop, start } = useSmoothScroll();
  const reduceMotion = useReducedMotion();
  const mensSubs = getMensSubLinks();

  useEffect(() => {
    if (menuOpen || mensOpen) stop();
    else start();
    return () => start();
  }, [menuOpen, mensOpen, stop, start]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 80) setMensOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]!);

  function closeMobile() {
    setOpenPath(null);
    setMobileMensOpen(false);
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background/90 text-foreground backdrop-blur-xl"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          closeMobile();
          menuButton.current?.focus();
        }
      }}
    >
      <div className="relative mx-auto flex h-[68px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:h-[76px] sm:px-8">
        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center gap-7 lg:flex"
        >
          <HeaderMegaMenu
            open={mensOpen}
            onOpenChange={setMensOpen}
          />
          <Link
            href="/shop"
            aria-current={isActive("/shop") ? "page" : undefined}
            className={cn(
              navLink,
              "group",
              isActive("/shop") && "text-foreground",
            )}
          >
            New
            <span
              className={cn(
                "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent transition-transform duration-300 motion-reduce:transition-none",
                isActive("/shop")
                  ? "scale-x-100"
                  : "scale-x-0 group-hover:scale-x-100",
              )}
              aria-hidden="true"
            />
          </Link>
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
            <X size={20} aria-hidden="true" />
          ) : (
            <Menu size={20} aria-hidden="true" />
          )}
        </button>

        <Link
          href="/"
          aria-label="House of Bollywood home"
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white px-2.5 py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        >
          <Image
            src="/brand/house-of-bollywood-logo.png"
            alt="House of Bollywood"
            width={1024}
            height={341}
            priority
            className="h-auto w-[112px] sm:w-[152px]"
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
              <span className="absolute top-0.5 right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground">
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </Link>
          <ThemeToggle />
          <Magnet
            padding={28}
            magnetStrength={4}
            disabled={!!reduceMotion}
            wrapperClassName="ml-1.5 inline-flex"
          >
            <Link
              href="/cart"
              aria-label={itemCount > 0 ? `Bag, ${itemCount} items` : "Bag"}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-3.5 text-background transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground sm:h-11 sm:px-4"
            >
              <ShoppingBag size={16} aria-hidden="true" />
              <span className="hidden text-[11px] font-semibold tracking-[0.12em] uppercase sm:inline">
                Bag
              </span>
              <span className="min-w-[1ch] text-xs font-semibold tabular-nums">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            </Link>
          </Magnet>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          data-lenis-prevent
          className="max-h-[calc(100dvh-76px)] overflow-y-auto border-t border-border bg-background lg:hidden"
        >
          <div className="px-5 pt-5 pb-2">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-muted uppercase">
              Menu
            </p>
          </div>
          <ul className="px-5 pb-6">
            <li>
              <button
                type="button"
                aria-expanded={mobileMensOpen}
                onClick={() => setMobileMensOpen((value) => !value)}
                className="flex min-h-14 w-full items-center gap-4 border-b border-border py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                <span className="font-display text-3xl tracking-wide">Mens</span>
                <ChevronDown
                  size={18}
                  className={cn(
                    "ml-auto text-muted transition-transform",
                    mobileMensOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>
              {mobileMensOpen ? (
                <ul className="border-b border-border bg-surface px-1 py-2">
                  {mensSubs.map((sub) => (
                    <li key={sub.href}>
                      <Link
                        href={sub.href}
                        onClick={closeMobile}
                        className="flex min-h-12 items-center gap-3 rounded-lg px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                      >
                        <span className="font-semibold">{sub.label}</span>
                        {!sub.available ? (
                          <span className="ml-auto text-[9px] tracking-[0.14em] text-muted uppercase">
                            Soon
                          </span>
                        ) : (
                          <span className="ml-auto text-[9px] tracking-[0.14em] text-accent uppercase">
                            Live
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/shop"
                      onClick={closeMobile}
                      className="flex min-h-12 items-center gap-2 px-3 py-2 text-sm font-semibold text-accent"
                    >
                      Shop all mens
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </Link>
                  </li>
                </ul>
              ) : null}
            </li>
            {[
              { href: "/shop", label: "New" },
              { href: "/search", label: "Search" },
              { href: "/wishlist", label: "Wishlist" },
              { href: "/account", label: "Account" },
              { href: "/cart", label: "Bag" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMobile}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className="group flex min-h-14 items-center gap-4 border-b border-border py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  <span className="font-display text-3xl tracking-wide">
                    {link.label}
                    {link.href === "/cart" && itemCount > 0
                      ? ` (${itemCount})`
                      : ""}
                    {link.href === "/wishlist" && count > 0
                      ? ` (${count})`
                      : ""}
                  </span>
                  <ArrowUpRight
                    size={18}
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
