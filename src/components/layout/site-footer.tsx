"use client";

import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useState } from "react";
import Magnet from "@/components/react-bits/Magnet";
import { siteConfig } from "@/config/site";

/**
 * Inspiration (Dribbble + Pinterest):
 * - Oversized wordmark footer (GRYM / Up There / streetwear type systems)
 * - Numbered link columns like packing-slip labels
 * - Bold CTA band before the link grid (Pinterest ecommerce footers)
 * - Dark bookend vs light header (editorial fashion sites)
 */

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
  "inline-flex min-h-9 items-center text-sm text-footer-foreground/70 transition-colors hover:text-footer-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export function SiteFooter() {
  const [notice, setNotice] = useState<string | null>(null);
  const { contact } = siteConfig;
  const reduceMotion = useReducedMotion();

  function scrollTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <footer className="mt-auto overflow-hidden border-t border-border bg-footer text-footer-foreground">
      <div className="mx-auto max-w-[1440px] px-6 pt-12 sm:px-8 sm:pt-16">
        {/* CTA band — cinema ticket energy without clutter */}
        <div className="flex flex-col justify-between gap-8 border-b border-footer-foreground/15 pb-10 sm:flex-row sm:items-end sm:pb-14">
          <div>
            <p className="mb-4 flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] text-gold uppercase">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              Now showing
            </p>
            <h2 className="max-w-xl font-display text-5xl leading-[0.92] tracking-tight sm:text-7xl">
              Off screen.
              <span className="block text-footer-foreground/45">On you.</span>
            </h2>
          </div>
          <Magnet padding={50} magnetStrength={3.2} disabled={!!reduceMotion}>
            <Link
              href="/shop"
              className="group inline-flex min-h-14 w-fit items-center gap-6 rounded-full bg-accent py-3 pr-3 pl-6 text-sm font-semibold text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Find your tee
              <span className="flex size-9 items-center justify-center rounded-full bg-accent-foreground/15 transition-transform group-hover:rotate-45 motion-reduce:transform-none">
                <ArrowUpRight size={18} aria-hidden="true" />
              </span>
            </Link>
          </Magnet>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-10 sm:py-12 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <p className="font-mono text-[10px] tracking-[0.2em] text-footer-foreground/40 uppercase">
              01 · House
            </p>
            <Link
              href="/"
              className="mt-3 inline-block text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              HOUSE OF BOLLYWOOD
              <span className="text-accent">.</span>
            </Link>
            <p className="mt-3 max-w-[260px] text-sm leading-6 text-footer-foreground/65">
              For the characters you love. For the way you make them yours.
            </p>
            <p className="mt-5 text-[10px] tracking-[0.18em] text-footer-foreground/45 uppercase">
              {contact.city} · India
            </p>
          </div>

          <nav aria-label="Footer shopping">
            <p className="font-mono text-[10px] tracking-[0.2em] text-footer-foreground/40 uppercase">
              02 · Wardrobe
            </p>
            <ul className="mt-3 space-y-1">
              {shopping.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer information">
            <p className="font-mono text-[10px] tracking-[0.2em] text-footer-foreground/40 uppercase">
              03 · Details
            </p>
            <ul className="mt-3 space-y-1">
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

          <div className="col-span-2 lg:col-span-1">
            <p className="font-mono text-[10px] tracking-[0.2em] text-footer-foreground/40 uppercase">
              04 · Hello
            </p>
            <div className="mt-3 flex flex-col gap-1">
              <a
                href={contact.emailHref}
                className={`${linkClass} gap-2 break-all`}
              >
                {contact.email}
                <ArrowUpRight size={14} className="shrink-0" aria-hidden="true" />
              </a>
              <a href={contact.phoneHref} className={linkClass}>
                {contact.phoneDisplay}
              </a>
            </div>
          </div>
        </div>

        <div role="status" aria-live="polite">
          {notice ? (
            <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-footer-foreground/15 bg-footer-foreground/5 p-4 text-sm">
              <p>
                <strong>{notice}:</strong> Preview only — this page connects in
                a later phase.
              </p>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="min-h-9 shrink-0 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Dismiss
              </button>
            </div>
          ) : null}
        </div>

        {/* Oversized type as layout — Dribbble streetwear footers */}
        <div
          aria-hidden="true"
          className="select-none overflow-hidden border-t border-footer-foreground/15 pt-4 text-center font-display text-[clamp(3.4rem,13vw,13rem)] leading-[0.82] tracking-[-0.02em] text-footer-foreground"
        >
          HOUSE OF
          <span className="text-accent"> BOLLYWOOD</span>
          <span className="text-accent">.</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-footer-foreground/15 py-5 text-[10px] text-footer-foreground/45 sm:text-xs">
          <p>© {new Date().getFullYear()} House of Bollywood</p>
          <span className="hidden sm:inline">
            Independent style. Individual expression.
          </span>
          <button
            type="button"
            onClick={scrollTop}
            className="inline-flex min-h-11 items-center gap-2 text-footer-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Back to top
            <ArrowUp size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
