"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HeaderMegaMenu } from "@/components/layout/header-mega-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useSmoothScroll } from "@/components/motion/smooth-scroll";
import { clothingGroups } from "@/config/navigation";
import { useCart } from "@/features/cart/cart-provider";
import { useWishlist } from "@/features/wishlist/wishlist-provider";

const iconBtn = "relative inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2";

export function SiteHeader() {
  const pathname = usePathname();
  // Remount disclosure state on navigation, including browser back/forward.
  return <HeaderContent key={pathname} />;
}

function HeaderContent() {
  const { itemCount } = useCart();
  const { count } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clothingOpen, setClothingOpen] = useState(false);
  const [newNotice, setNewNotice] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { stop, start } = useSmoothScroll();

  useEffect(() => {
    if (!mobileOpen) return;
    stop();
    return () => start();
  }, [mobileOpen, stop, start]);

  useEffect(() => {
    const breakpoint = window.matchMedia("(min-width: 1024px)");
    const closeMenus = () => { setMobileOpen(false); setClothingOpen(false); setNewNotice(false); };
    breakpoint.addEventListener("change", closeMenus);
    return () => breakpoint.removeEventListener("change", closeMenus);
  }, []);

  const close = () => { setMobileOpen(false); setClothingOpen(false); setNewNotice(false); };
  const newIn = <button type="button" aria-expanded={newNotice} aria-controls="new-in-notice" onClick={() => { setNewNotice(!newNotice); setClothingOpen(false); }} className="min-h-11 text-left text-xs font-semibold uppercase tracking-[0.14em] focus-visible:outline-2 focus-visible:outline-offset-4">New In <span className="ml-1 text-[9px] font-normal text-muted">Preview</span></button>;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background text-foreground" onKeyDown={(event) => {
      if (event.key === "Escape") { close(); if (mobileOpen) menuButton.current?.focus(); }
    }}>
      <div className="relative mx-auto flex h-[72px] max-w-[1440px] items-center gap-2 px-3 sm:px-8 lg:h-[88px] lg:gap-10">
        <button ref={menuButton} type="button" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} aria-controls="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} className={`${iconBtn} lg:hidden`}>
          {mobileOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
        </button>
        <Link href="/" onClick={close} aria-label="House of Bollywood home" className="shrink-0 rounded bg-white px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-4">
          <Image src="/brand/house-of-bollywood-logo.png" alt="House of Bollywood" width={1024} height={341} priority className="h-auto w-[108px] sm:w-[144px] lg:w-[168px]" />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {newIn}
          <HeaderMegaMenu open={clothingOpen} onOpenChange={(open) => { setClothingOpen(open); if (open) setNewNotice(false); }} />
        </nav>
        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <Link href="/search" onClick={close} aria-label="Search" className={iconBtn}><Search size={20} aria-hidden="true" /></Link>
          <div className="hidden lg:block"><Link href="/wishlist" aria-label={`Wishlist, ${count} saved`} className={iconBtn}><Heart size={20} aria-hidden="true" />{count > 0 && <span className="absolute right-0 top-0 rounded-full bg-foreground px-1 text-[10px] text-background">{count > 99 ? "99+" : count}</span>}</Link></div>
          <div className="hidden lg:block"><Link href="/account" aria-label="Account" className={iconBtn}><User size={20} aria-hidden="true" /></Link></div>
          <Link href="/cart" onClick={close} aria-label={`Bag, ${itemCount} items`} className={`${iconBtn} gap-1 lg:w-auto lg:px-3`}><ShoppingBag size={20} aria-hidden="true" /><span className="text-[11px] tabular-nums">{itemCount > 99 ? "99+" : itemCount}</span></Link>
          <div className="ml-2 hidden lg:block"><ThemeToggle /></div>
        </div>
      </div>
      {newNotice && <div id="new-in-notice" role="status" className="flex items-center justify-between gap-4 border-t border-border bg-surface px-5 py-3 text-sm"><p>New In is a preview. Arrival dates have not been added yet. <Link href="/shop" onClick={close} className="underline underline-offset-4">Browse the current collection</Link></p><button type="button" aria-label="Dismiss new arrivals notice" onClick={() => setNewNotice(false)} className={iconBtn}><X size={18} /></button></div>}
      {mobileOpen && <nav id="mobile-menu" aria-label="Mobile" data-lenis-prevent className="max-h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain border-t border-border bg-background px-5 pb-6 lg:hidden">
        <div className="flex items-center justify-between border-b border-border py-3">{newIn}<Link href="/shop" onClick={close} className="py-3 text-sm underline underline-offset-4">Shop all</Link></div>
        <p className="mb-3 mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Clothing</p>
        {clothingGroups.map((group) => <details key={group.label} className="group border-b border-border"><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-display text-3xl focus-visible:outline-2 [&::-webkit-details-marker]:hidden">{group.label}<ChevronDown size={18} aria-hidden="true" className="group-open:rotate-180" /></summary><ul className="pb-3">{group.items.map((item) => <li key={item.label}>{item.href ? <Link href={item.href} onClick={close} className="flex min-h-12 items-center justify-between text-sm font-semibold">{item.label}<ArrowUpRight size={16} aria-hidden="true" /></Link> : <span className="flex min-h-12 items-center justify-between text-sm text-muted">{item.label}<span className="text-[9px] uppercase tracking-wider">Preview</span></span>}</li>)}</ul></details>)}
        <p className="mt-4 text-xs leading-5 text-muted">Preview categories show the proposed range. Browse graphic tees now.</p>
        <div className="mt-6 grid grid-cols-2 gap-3"><Link href="/wishlist" onClick={close} className="flex min-h-12 items-center gap-2 rounded-lg border border-border px-3 text-sm"><Heart size={17} />Wishlist ({count})</Link><Link href="/account" onClick={close} className="flex min-h-12 items-center gap-2 rounded-lg border border-border px-3 text-sm"><User size={17} />Account</Link></div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="text-sm">Appearance</span><ThemeToggle /></div>
      </nav>}
    </header>
  );
}
