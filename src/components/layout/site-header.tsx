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
 * Floating glass clothes-shop header — Mens mega menu + New.
 * GSAP mega panel (HeaderMegaMenu). Subcats from live catalog shelves.
 */

const iconBtn =
  "relative inline-flex size-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { count } = useWishlist();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mensOpen, setMensOpen] = useState(false);
  const [mobileMensOpen, setMobileMensOpen] = useState(false);
  const menuOpen = openPath === pathname;
  const menuButton = useRef<HTMLButtonElement>(null);
  const { stop, start } = useSmoothScroll();
  const reduceMotion = useReducedMotion();
  const isHome = pathname === "/";
  const mensSubs = getMensSubLinks();

  useEffect(() => {
    if (menuOpen || mensOpen) stop();
    else start();
    return () => start();
  }, [menuOpen, mensOpen, stop, start]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      if (window.scrollY > 80) setMensOpen(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]!);

  const overHero = isHome && !scrolled && !menuOpen && !mensOpen;

  function closeMobile() {
    setOpenPath(null);
    setMobileMensOpen(false);
  }

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
        onKeyDown={(event) => {
          if (event.key === "Escape" && menuOpen) {
            closeMobile();
            menuButton.current?.focus();
          }
        }}
      >
        <div
          className={cn(
            "pointer-events-auto mx-auto max-w-[1280px] overflow-visible rounded-[1.75rem] border transition-[background,box-shadow,border-color] duration-500 motion-reduce:transition-none",
            overHero
              ? "border-white/20 bg-white/10 text-white shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl"
              : "border-border/80 bg-background/85 text-foreground shadow-[0_16px_50px_rgba(19,6,3,0.08)] backdrop-blur-2xl",
            menuOpen && "overflow-hidden rounded-b-none sm:rounded-b-[1.75rem]",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between gap-2 border-b px-4 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase sm:px-5",
              overHero
                ? "border-white/15 text-white/80"
                : "border-border text-muted",
            )}
          >
            <span className="flex items-center gap-2">
              <span
                className="relative flex size-2 items-center justify-center"
                aria-hidden="true"
              >
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent/50 motion-reduce:animate-none" />
                <span className="relative size-1.5 rounded-full bg-accent" />
              </span>
              Now showing · Graphic tees
            </span>
            <span
              className={cn("hidden sm:inline", overHero ? "text-white/55" : "")}
            >
              Junagadh
            </span>
          </div>

          <div className="relative flex h-[64px] items-center justify-between gap-2 px-3 sm:h-[72px] sm:px-5">
            <nav
              aria-label="Primary"
              className="hidden flex-1 items-center gap-6 lg:flex"
            >
              <HeaderMegaMenu
                open={mensOpen}
                onOpenChange={setMensOpen}
                overHero={overHero}
              />
              <Link
                href="/shop"
                aria-current={isActive("/shop") ? "page" : undefined}
                className={cn(
                  "group relative py-2 text-[11px] font-semibold tracking-[0.16em] uppercase focus-visible:outline-2 focus-visible:outline-offset-4",
                  overHero
                    ? "text-white/75 hover:text-white focus-visible:outline-white"
                    : isActive("/shop")
                      ? "text-foreground focus-visible:outline-foreground"
                      : "text-muted hover:text-foreground focus-visible:outline-foreground",
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
              className={cn(
                iconBtn,
                "lg:hidden",
                overHero && "text-white hover:bg-white/10",
              )}
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
              className={cn(
                "absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-4",
                overHero
                  ? "bg-white/95 focus-visible:outline-white"
                  : "bg-white focus-visible:outline-foreground",
              )}
            >
              <Image
                src="/brand/house-of-bollywood-logo.png"
                alt="House of Bollywood"
                width={1024}
                height={341}
                priority
                className="h-auto w-[108px] sm:w-[148px]"
              />
            </Link>

            <div className="flex flex-1 items-center justify-end gap-0.5">
              <Link
                href="/search"
                aria-label="Search"
                className={cn(
                  iconBtn,
                  "hidden sm:inline-flex",
                  overHero && "text-white hover:bg-white/10",
                )}
              >
                <Search size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/account"
                aria-label="Account"
                className={cn(
                  iconBtn,
                  "hidden lg:inline-flex",
                  overHero && "text-white hover:bg-white/10",
                )}
              >
                <User size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/wishlist"
                aria-label={count > 0 ? `Wishlist, ${count} saved` : "Wishlist"}
                className={cn(
                  iconBtn,
                  "hidden lg:inline-flex",
                  overHero && "text-white hover:bg-white/10",
                )}
              >
                <Heart size={18} aria-hidden="true" />
                {count > 0 ? (
                  <span className="absolute top-0.5 right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground">
                    {count > 99 ? "99+" : count}
                  </span>
                ) : null}
              </Link>
              <div
                className={cn(
                  overHero &&
                    "[&_button]:border-white/25 [&_button]:bg-white/10 [&_button]:text-white",
                )}
              >
                <ThemeToggle />
              </div>
              <Magnet
                padding={32}
                magnetStrength={3.8}
                disabled={!!reduceMotion}
                wrapperClassName="ml-1 inline-flex"
              >
                <Link
                  href="/cart"
                  aria-label={
                    itemCount > 0 ? `Bag, ${itemCount} items` : "Bag"
                  }
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-accent px-3.5 text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:h-11 sm:px-4"
                >
                  <ShoppingBag size={17} aria-hidden="true" />
                  <span className="hidden text-[11px] font-semibold tracking-[0.14em] uppercase sm:inline">
                    Bag
                  </span>
                  <span className="min-w-[1.1ch] text-xs font-semibold tabular-nums">
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
              className="max-h-[calc(100dvh-140px)] overflow-y-auto border-t border-border bg-background text-foreground lg:hidden"
            >
              <div className="px-5 pt-5 pb-2">
                <p className="text-[10px] font-semibold tracking-[0.22em] text-muted uppercase">
                  Enter the house
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
                    <span className="w-8 font-mono text-[11px] tabular-nums text-muted">
                      01
                    </span>
                    <span className="font-display text-3xl tracking-wide">
                      Mens
                    </span>
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
                    <ul className="border-b border-border bg-surface/60 px-2 py-2">
                      {mensSubs.map((sub, index) => (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            onClick={closeMobile}
                            className="flex min-h-12 items-center gap-3 rounded-lg px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                          >
                            <span className="font-mono text-[10px] text-muted">
                              {String(index + 1).padStart(2, "0")}
                            </span>
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
                ].map((link, index) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMobile}
                      aria-current={
                        isActive(link.href) ? "page" : undefined
                      }
                      className="group flex min-h-14 items-center gap-4 border-b border-border py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    >
                      <span className="w-8 font-mono text-[11px] tabular-nums text-muted">
                        {String(index + 2).padStart(2, "0")}
                      </span>
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
        </div>
      </header>
      {!isHome ? (
        <div
          className="h-[7.25rem] shrink-0 sm:h-[8rem]"
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}
