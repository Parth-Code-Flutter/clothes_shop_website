"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useReducedMotion } from "motion/react";
import Magnet from "@/components/react-bits/Magnet";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { Button } from "@/components/ui/button";

/** Finale — fully theme-aware shop CTA + newsletter preview. */
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
    <section
      id="shop"
      className="bg-background px-6 py-24 text-foreground sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-[1440px]">
        <RevealOnScroll>
          <p className="text-[10px] font-semibold tracking-[0.32em] text-accent uppercase">
            Enter the shop
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-5xl tracking-tight sm:text-7xl lg:text-8xl">
            The board is live.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted">
            Graphic tees from the verified catalog. Bag it. Checkout stays a
            preview until payments connect.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Magnet padding={48} magnetStrength={3.2} disabled={!!reduceMotion}>
              <Link
                href="/shop"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Shop all tees
              </Link>
            </Magnet>
            <Link
              href="/search"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-surface px-8 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              Search cast
            </Link>
          </div>
        </RevealOnScroll>

        <RevealOnScroll
          className="mt-20 border-t border-border pt-12"
          delay={0.08}
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-md">
              <p className="text-[10px] font-semibold tracking-[0.28em] text-muted uppercase">
                House updates
              </p>
              <h3 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
                Stay close to the next drop
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted">
                Preview only. Nothing is subscribed, stored, or emailed.
              </p>
            </div>
            <form onSubmit={onSubmit} className="w-full max-w-md" noValidate>
              <label htmlFor="home-finale-email" className="sr-only">
                Email address
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
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
                  className="h-12 flex-1 rounded-full border border-border bg-surface px-5 text-sm text-foreground outline-none placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                />
                <Button type="submit">Preview join</Button>
              </div>
              {message ? (
                <p className="mt-3 text-sm text-muted" role="status">
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
