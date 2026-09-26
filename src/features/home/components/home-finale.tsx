"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useReducedMotion } from "motion/react";
import Magnet from "@/components/react-bits/Magnet";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

/** Closing invitation and a newsletter preview that does not store email. */
export function HomeFinale() {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!valid) {
      setMessage("Enter a valid email to preview the form.");
      return;
    }
    setMessage(
      "Subscriptions are not connected yet. Your email was not saved or sent.",
    );
  }

  return (
    <section id="shop" className="bg-footer text-footer-foreground">
      <div className="mx-auto max-w-[1440px] px-6 py-24 sm:px-8 sm:py-32 lg:pr-20">
        <RevealOnScroll>
          <p className="text-[10px] font-semibold tracking-[0.34em] text-gold uppercase">
            04 — The house
          </p>
          <h2 className="mt-8 max-w-4xl font-display text-6xl leading-[0.9] tracking-tight sm:text-8xl">
            The wardrobe is open.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-footer-foreground/70">
            Shirts, denim, trousers, and jackets. Checkout stays a preview until payments connect.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Magnet padding={48} magnetStrength={3.2} disabled={!!reduceMotion}>
              <Link
                href="/shop"
                className="inline-flex min-h-12 items-center justify-center bg-accent px-8 text-sm font-semibold text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Shop the edit
              </Link>
            </Magnet>
            <Link
              href="/search"
              className="inline-flex min-h-12 items-center justify-center border border-footer-foreground/25 px-8 text-sm font-semibold text-footer-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Search the edit
            </Link>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="mt-20 border-t border-footer-foreground/15 pt-12" delay={0.08}>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-5">
              <p className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase">
                House updates
              </p>
              <h3 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
                Stay close to the next drop
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-footer-foreground/70">
                Preview only. Nothing is subscribed, stored, or emailed.
              </p>
            </div>
            <form onSubmit={onSubmit} className="lg:col-span-7" noValidate>
              <label
                htmlFor="home-finale-email"
                className="text-[10px] font-semibold tracking-[0.22em] text-footer-foreground/60 uppercase"
              >
                Email address
              </label>
              <div className="mt-3 flex flex-col gap-4 border-b border-footer-foreground/30 pb-3 sm:flex-row sm:items-center">
                <input
                  id="home-finale-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setMessage(null);
                  }}
                  placeholder="you@email.com"
                  className="h-12 w-full flex-1 bg-transparent text-base text-footer-foreground outline-none placeholder:text-footer-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center px-2 text-sm font-semibold tracking-wide text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
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
        </RevealOnScroll>
      </div>
    </section>
  );
}
