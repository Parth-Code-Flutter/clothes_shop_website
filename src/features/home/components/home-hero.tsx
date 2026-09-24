"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function HomeHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate min-h-[88vh] overflow-hidden bg-[#05070f] text-white">
      <Image
        src="/images/homepage/slide-1.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center] sm:object-right"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/15"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(234,25,22,0.35),transparent_42%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 py-16 sm:px-6 sm:py-24 lg:justify-center lg:px-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="text-xs font-semibold tracking-[0.35em] text-gold uppercase">
            House of Bollywood · Junagadh
          </p>
          <Image
            src="/brand/house-of-bollywood-logo.png"
            alt={siteConfig.name}
            width={1024}
            height={341}
            priority
            className="mt-5 h-16 w-auto drop-shadow-[0_12px_40px_rgba(0,0,0,0.55)] sm:h-24 lg:h-28"
          />
          <h1 className="mt-8 font-display text-6xl leading-[0.9] tracking-tight sm:text-8xl lg:text-9xl">
            {siteConfig.tagline}
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/78 sm:text-lg">
            Pop-culture oversized drops for Gen Z closets. Real catalog pieces —
            shop, save, bag, checkout preview.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/shop"
              className={cn(
                "inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold tracking-wide text-accent-foreground transition-colors hover:bg-[#c41010] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
            >
              Shop the drop
            </Link>
            <Link
              href="/search"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/35 bg-white/5 px-7 text-sm font-semibold tracking-wide text-white backdrop-blur transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Search catalog
            </Link>
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center rounded-full border border-transparent px-7 text-sm font-semibold tracking-wide text-white/80 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={() => {
                document
                  .getElementById("drop-stage")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Meet the cast
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
