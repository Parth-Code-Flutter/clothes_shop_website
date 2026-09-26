"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/config/site";

const shopping = [
  { label: "Shop all", href: "/shop" },
  { label: "Search", href: "/search" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "My bag", href: "/cart" },
  { label: "My account", href: "/account" },
] as const;

const info = [
  "About us",
  "Blog",
  "Privacy policy",
  "Terms & conditions",
  "Returns & refunds",
] as const;

const linkClass =
  "inline-flex min-h-10 items-center text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

/** Light colophon. The homepage close stays the dark band above this. */
export function SiteFooter() {
  const [notice, setNotice] = useState<string | null>(null);
  const { contact } = siteConfig;

  function scrollTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <footer className="mt-auto border-t-2 border-gold bg-surface text-foreground">
      <div className="mx-auto max-w-[1440px] px-6 pt-14 sm:px-8 sm:pt-16 lg:pr-20">
        <div className="flex flex-col gap-8 border-b border-border pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.34em] text-gold uppercase">
              Colophon
            </p>
            <p className="mt-3 font-display text-4xl tracking-wide sm:text-5xl">
              {siteConfig.name}
            </p>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted">
            {contact.city}, India. Shirts, denim, trousers, and jackets.
          </p>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12">
          <nav aria-label="Footer shopping" className="lg:col-span-3">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase">
              Wardrobe
            </p>
            <ul className="mt-4">
              {shopping.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer information" className="lg:col-span-3">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase">
              Details
            </p>
            <ul className="mt-4">
              {info.map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => setNotice(label)}
                    className={`${linkClass} text-left`}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sm:col-span-2 lg:col-span-6 lg:pl-10">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase">
              Visit
            </p>
            <div className="mt-4 flex flex-col gap-1">
              <a href={contact.phoneHref} className={`${linkClass} text-base text-foreground`}>
                {contact.phoneDisplay}
              </a>
              <a
                href={contact.emailHref}
                className={`${linkClass} break-all text-base text-foreground`}
              >
                {contact.email}
              </a>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-6 text-muted">
              Questions about a drop go to the shop in {contact.city}. Policy pages are still a preview.
            </p>
          </div>
        </div>

        <div role="status" aria-live="polite">
          {notice ? (
            <div className="mb-8 flex items-start justify-between gap-4 border border-border bg-surface px-4 py-4 text-sm">
              <p>
                <strong>{notice}:</strong> Preview only — this page connects in a later phase.
              </p>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="min-h-10 shrink-0 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Dismiss
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-5 text-[11px] tracking-[0.14em] text-muted uppercase">
          <p>© {new Date().getFullYear()} {siteConfig.name}</p>
          <button
            type="button"
            onClick={scrollTop}
            className="inline-flex min-h-11 items-center gap-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Back to top
            <ArrowUp size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="select-none overflow-hidden px-6 pb-2 text-center font-display text-[clamp(2.6rem,11vw,9.5rem)] leading-none tracking-tight text-foreground/15 sm:px-8"
      >
        {siteConfig.name}
      </p>
    </footer>
  );
}
