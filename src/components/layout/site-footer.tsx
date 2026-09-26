"use client";

import Link from "next/link";
import { ArrowRight, ArrowUp, Camera, MapPin } from "lucide-react";
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
  "inline-flex min-h-8 items-center text-[13px] text-footer-foreground/65 transition-colors hover:text-footer-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";

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
      <div className="overflow-hidden border-y border-footer-foreground/10 py-2.5" aria-label="Store benefits">
        <div className="flex w-max animate-marquee items-center text-[10px] font-bold tracking-[0.22em] text-footer-foreground/65 uppercase motion-reduce:animate-none">
          {[0, 1, 2].map((copy) => (
            <div key={copy} className="flex items-center" aria-hidden={copy > 0}>
              {[
                "Fresh fits, daily",
                "Easy returns",
                "Secure checkout",
                `Curated in ${contact.city}`,
              ].map((label) => (
                <span key={`${copy}-${label}`} className="flex items-center whitespace-nowrap"><span className="px-8">{label}</span><span className="size-1.5 rotate-45 bg-accent" /></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1360px] px-6 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="grid items-center gap-9 border-b border-footer-foreground/12 pb-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-[10px] font-semibold tracking-[0.34em] text-gold uppercase">
              The house
            </p>
            <p className="mt-3 max-w-xl font-display text-4xl leading-[0.92] tracking-wide sm:text-5xl lg:text-6xl">
              Dress like the <span className="text-accent">scene is yours.</span>
            </p>
            <p className="mt-4 max-w-md text-[13px] leading-6 text-footer-foreground/55">
              The wardrobe is open. Shirts, denim, trousers, and jackets from {contact.city}.
            </p>
            <Link
              href="/shop"
              className="mt-5 inline-flex min-h-9 items-center border-b border-gold pb-0.5 text-[13px] font-semibold tracking-wide text-footer-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Shop the edit <ArrowRight className="ml-3 size-4" aria-hidden="true" />
            </Link>
          </div>

          <form onSubmit={onSubmit} className="lg:col-span-6 lg:border-l lg:border-footer-foreground/12 lg:pl-12" noValidate>
            <label
              htmlFor="footer-email"
              className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase"
            >
              Next drop
            </label>
            <p className="mt-2 max-w-md text-[13px] leading-6 text-footer-foreground/55">
              A note when something new is placed. Nothing is stored or sent yet.
            </p>
            <div className="mt-4 flex gap-3 border-b border-footer-foreground/25 pb-2 sm:items-center">
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
                className="h-10 min-w-0 flex-1 bg-transparent text-sm text-footer-foreground outline-none placeholder:text-footer-foreground/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              />
              <button
                type="submit"
                className="inline-flex min-h-10 shrink-0 items-center text-xs font-semibold tracking-wide text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
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

        <div className="grid gap-8 py-9 sm:grid-cols-2 lg:grid-cols-12">
          <nav aria-label="Footer shopping" className="lg:col-span-3">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase">
              Wardrobe
            </p>
            <ul className="mt-2">
              {shopping.map((link, index) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    <span className="mr-3 font-mono text-[9px] text-gold/70">{String(index + 1).padStart(2, "0")}</span>{link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer information" className="lg:col-span-3">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase">
              Details
            </p>
            <ul className="mt-2">
              {info.map((label) => (
                <li key={label}>
                  <button type="button" onClick={() => setNotice(label)} className={`${linkClass} text-left`}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sm:col-span-2 lg:col-span-6 lg:border-l lg:border-footer-foreground/12 lg:pl-12">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase">
              Visit
            </p>
            <div className="mt-2 flex flex-col">
              <a href={contact.phoneHref} className={`${linkClass} text-sm text-footer-foreground`}>
                {contact.phoneDisplay}
              </a>
              <a
                href={contact.emailHref}
                className={`${linkClass} break-all text-sm text-footer-foreground`}
              >
                {contact.email}
              </a>
            </div>
            <p className="mt-2 flex items-center gap-2 text-xs leading-6 text-footer-foreground/50">
              <MapPin size={14} aria-hidden="true" /> {contact.city}, India
            </p>
            <button type="button" onClick={() => setNotice("Instagram")} className="mt-3 inline-flex size-9 items-center justify-center rounded-full border border-footer-foreground/20 text-footer-foreground transition-colors hover:border-accent hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold" aria-label="House of Bollywood on Instagram"><Camera size={15} aria-hidden="true" /></button>
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-footer-foreground/12 pt-5 text-[10px] tracking-[0.16em] text-footer-foreground/45 uppercase">
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
