"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { type FormEvent, useState } from "react";
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
  "inline-flex min-h-10 items-center text-sm text-footer-foreground/70 transition-colors hover:text-footer-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";

/** One close for the site: the house line, the note, and the wardrobe index. */
export function SiteFooter() {
  const [notice, setNotice] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const { contact } = siteConfig;

  function scrollTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!valid) {
      setMessage("Enter a valid email to preview the form.");
      return;
    }
    setMessage("Subscriptions are not connected yet. Your email was not saved or sent.");
  }

  return (
    <footer id="shop" className="mt-auto bg-footer text-footer-foreground">
      <div className="mx-auto max-w-[1440px] px-6 py-16 sm:px-8 sm:py-20 lg:pr-20 lg:py-24">
        <div className="grid items-end gap-12 border-b border-footer-foreground/15 pb-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[10px] font-semibold tracking-[0.34em] text-gold uppercase">
              The house
            </p>
            <p className="mt-4 font-display text-5xl leading-[0.92] tracking-tight sm:text-7xl">
              {siteConfig.name}
            </p>
            <p className="mt-5 max-w-md text-sm leading-7 text-footer-foreground/65">
              The wardrobe is open. Shirts, denim, trousers, and jackets from {contact.city}.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex min-h-11 items-center border-b border-gold pb-1 text-sm font-semibold tracking-wide text-footer-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Shop the edit
            </Link>
          </div>

          <form onSubmit={onSubmit} className="lg:col-span-5" noValidate>
            <label
              htmlFor="footer-email"
              className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase"
            >
              Next drop
            </label>
            <p className="mt-3 text-sm leading-6 text-footer-foreground/65">
              A note when something new is placed. Nothing is stored or sent yet.
            </p>
            <div className="mt-5 flex flex-col gap-3 border-b border-footer-foreground/25 pb-3 sm:flex-row sm:items-center">
              <input
                id="footer-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setMessage(null);
                }}
                placeholder="you@email.com"
                className="h-12 w-full flex-1 bg-transparent text-base text-footer-foreground outline-none placeholder:text-footer-foreground/35 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center text-sm font-semibold tracking-wide text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                Preview join
              </button>
            </div>
            {message ? (
              <p className="mt-3 text-sm text-footer-foreground/70" role="status">
                {message}
              </p>
            ) : null}
          </form>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12">
          <nav aria-label="Footer shopping" className="lg:col-span-3">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase">
              Wardrobe
            </p>
            <ul className="mt-3">
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
            <ul className="mt-3">
              {info.map((label) => (
                <li key={label}>
                  <button type="button" onClick={() => setNotice(label)} className={`${linkClass} text-left`}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sm:col-span-2 lg:col-span-6 lg:border-l lg:border-footer-foreground/15 lg:pl-12">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase">
              Visit
            </p>
            <div className="mt-3 flex flex-col">
              <a href={contact.phoneHref} className={`${linkClass} text-base text-footer-foreground`}>
                {contact.phoneDisplay}
              </a>
              <a
                href={contact.emailHref}
                className={`${linkClass} break-all text-base text-footer-foreground`}
              >
                {contact.email}
              </a>
            </div>
            <p className="mt-4 text-sm leading-6 text-footer-foreground/55">
              {contact.city}, India
            </p>
          </div>
        </div>

        <div role="status" aria-live="polite">
          {notice ? (
            <div className="mb-8 flex items-start justify-between gap-4 border border-footer-foreground/20 px-4 py-4 text-sm">
              <p>
                <strong>{notice}:</strong> Preview only — this page connects in a later phase.
              </p>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="min-h-10 shrink-0 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Dismiss
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-footer-foreground/15 pt-5 text-[11px] tracking-[0.16em] text-footer-foreground/50 uppercase">
          <p>© {new Date().getFullYear()} {siteConfig.name}</p>
          <button
            type="button"
            onClick={scrollTop}
            className="inline-flex min-h-11 items-center gap-2 text-footer-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Back to top
            <ArrowUp size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
