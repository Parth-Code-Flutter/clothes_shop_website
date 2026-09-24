"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, User, X, Heart } from "lucide-react";
import { useState } from "react";
import { PreviewNotice } from "@/components/shared/preview-notice";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useCart } from "@/features/cart/cart-provider";
import { useWishlist } from "@/features/wishlist/wishlist-provider";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/cart", label: "Bag" },
  { href: "/account", label: "Account" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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

        <Link href="/" className="mr-auto inline-flex lg:mr-8">
          <Image
            src="/brand/house-of-bollywood-logo.png"
            alt="House of Bollywood"
            width={1024}
            height={341}
            priority
            className="h-9 w-auto sm:h-11"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium tracking-[0.18em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
                isActive(link.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:text-accent",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-1 lg:flex">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setPreview("Search")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Search aria-hidden="true" className="size-5" />
          </button>
          <Link
            href="/account"
            aria-label="Account"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <User aria-hidden="true" className="size-5" />
          </Link>
          <Link
            href="/wishlist"
            aria-label={
              wishlistCount > 0
                ? `Wishlist, ${wishlistCount} saved`
                : "Wishlist"
            }
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Heart aria-hidden="true" className="size-5" />
            {wishlistCount > 0 ? (
              <span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/cart"
            aria-label={itemCount > 0 ? `Bag, ${itemCount} items` : "Bag"}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ShoppingBag aria-hidden="true" className="size-5" />
            {itemCount > 0 ? (
              <span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>
          <ThemeToggle />
        </div>
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <Link
            href="/wishlist"
            aria-label={
              wishlistCount > 0
                ? `Wishlist, ${wishlistCount} saved`
                : "Wishlist"
            }
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Heart aria-hidden="true" className="size-5" />
            {wishlistCount > 0 ? (
              <span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/cart"
            aria-label={itemCount > 0 ? `Bag, ${itemCount} items` : "Bag"}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ShoppingBag aria-hidden="true" className="size-5" />
            {itemCount > 0 ? (
              <span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="flex flex-col border-t border-border bg-background px-4 py-4 lg:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex h-12 items-center text-left text-2xl font-semibold tracking-tight",
                isActive(link.href) ? "text-accent" : "text-foreground",
              )}
            >
              {link.label}
              {link.href === "/cart" && itemCount > 0 ? ` (${itemCount})` : ""}
              {link.href === "/wishlist" && wishlistCount > 0
                ? ` (${wishlistCount})`
                : ""}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setPreview("Search");
            }}
            className="flex h-12 w-full items-center text-left text-lg text-foreground"
          >
            Search
          </button>
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
