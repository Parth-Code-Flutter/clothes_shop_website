"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HeaderMegaMenu } from "@/components/layout/header-mega-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useSmoothScroll } from "@/components/motion/smooth-scroll";
import { clothingGroups, featuredNavigation } from "@/config/navigation";
import { useCart } from "@/features/cart/cart-provider";
import { useWishlist } from "@/features/wishlist/wishlist-provider";

const iconBtn =
  "relative inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2";

export function SiteHeader() {
  const pathname = usePathname();
  return <HeaderContent key={pathname} />;
}

function HeaderContent() {
  const { itemCount } = useCart();
  const { count } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menOpen, setMenOpen] = useState(false);
  const [mobileMenOpen, setMobileMenOpen] = useState(true);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { stop, start } = useSmoothScroll();

  useEffect(() => {
    if (!mobileOpen) return;
    stop();
    return () => start();
  }, [mobileOpen, stop, start]);

  const close = () => {
    setMobileOpen(false);
    setMenOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background/95 text-foreground backdrop-blur-md"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          close();
          if (mobileOpen) menuButton.current?.focus();
        }
      }}
    >
      <div className="flex h-[68px] items-center gap-3 px-3 lg:h-[76px]">
        <button
          ref={menuButton}
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((open) => !open)}
          className={`${iconBtn} lg:hidden`}
        >
          {mobileOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
        </button>
        <Link
          href="/"
          onClick={close}
          aria-label="House of Bollywood home"
          className="shrink-0 rounded bg-white px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <Image
            src="/brand/house-of-bollywood-logo.png"
            alt="House of Bollywood"
            width={1024}
            height={341}
            priority
            className="h-auto w-[108px] sm:w-[132px]"
          />
        </Link>
        <nav aria-label="Primary" className="relative ml-7 hidden h-full items-center gap-7 lg:flex">
          <HeaderMegaMenu open={menOpen} onOpenChange={setMenOpen} />
          {featuredNavigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex h-full items-center text-[11px] font-bold tracking-[0.16em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${"accent" in item && item.accent ? "text-accent" : "text-foreground"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <Link href="/search" onClick={close} aria-label="Search" className={iconBtn}>
            <Search size={20} aria-hidden="true" />
          </Link>
          <div className="hidden lg:block">
            <Link href="/wishlist" aria-label={`Wishlist, ${count} saved`} className={iconBtn}>
              <Heart size={20} aria-hidden="true" />
              {count > 0 ? (
                <span className="absolute top-1 right-1 min-w-4 rounded-full bg-foreground px-1 text-center text-[10px] text-background">
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
            </Link>
          </div>
          <div className="hidden lg:block">
            <Link href="/account" aria-label="Account" className={iconBtn}>
              <User size={20} aria-hidden="true" />
            </Link>
          </div>
          <Link
            href="/cart"
            onClick={close}
            aria-label={`Bag, ${itemCount} items`}
            className={`${iconBtn} gap-1 lg:w-auto lg:px-3`}
          >
            <ShoppingBag size={20} aria-hidden="true" />
            <span className="text-[11px] tabular-nums">{itemCount > 99 ? "99+" : itemCount}</span>
          </Link>
          <div className="ml-1 hidden lg:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
      {mobileOpen ? (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          data-lenis-prevent
          className="max-h-[calc(100dvh-68px)] overflow-y-auto border-t border-border bg-background px-5 pb-6 lg:hidden"
        >
          <div className="border-b border-border py-3">
            <button type="button" aria-expanded={mobileMenOpen} onClick={() => setMobileMenOpen((open) => !open)} className="flex min-h-14 w-full items-center justify-between font-display text-4xl tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              Men <ChevronDown size={20} aria-hidden="true" className={`transition-transform ${mobileMenOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileMenOpen ? (
              <ul className="grid grid-cols-2 gap-x-4 pb-4">
                {clothingGroups.map((group, index) => (
                  <li key={group.label} className="border-t border-border">
                    <Link href={group.href} onClick={close} className="flex min-h-12 items-center gap-2 text-sm font-semibold">
                      <span className="font-mono text-[9px] text-muted">0{index + 1}</span>{group.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <ul className="divide-y divide-border">
            {featuredNavigation.map((item) => (
              <li key={item.label}>
                <Link href={item.href} onClick={close} className={`flex min-h-14 items-center justify-between font-display text-3xl tracking-wide ${"accent" in item && item.accent ? "text-accent" : ""}`}>
                  {item.label}<span className="font-mono text-[9px] tracking-normal text-muted">Explore</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href="/wishlist" onClick={close} className="flex min-h-12 items-center gap-2 border border-border px-3 text-sm">
              <Heart size={17} aria-hidden="true" /> Wishlist ({count})
            </Link>
            <Link href="/account" onClick={close} className="flex min-h-12 items-center gap-2 border border-border px-3 text-sm">
              <User size={17} aria-hidden="true" /> Account
            </Link>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm">Appearance</span>
            <ThemeToggle />
          </div>
        </nav>
      ) : null}
    </header>
  );
}
