"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function HomeHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate min-h-[78vh] overflow-hidden bg-[#07162f] text-white sm:min-h-[86vh]">
      <Image
        src="/images/homepage/slide-1.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#07162f] via-[#07162f]/85 to-[#07162f]/20"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(234,25,22,0.28),transparent_45%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-4 py-16 sm:min-h-[86vh] sm:px-6 sm:py-24 lg:justify-center lg:px-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl"
        >
          <Image
            src="/brand/house-of-bollywood-logo.png"
            alt={siteConfig.name}
            width={1024}
            height={341}
            priority
            className="h-14 w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:h-20 lg:h-24"
          />
          <h1 className="mt-8 font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            {siteConfig.tagline}
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/80 sm:text-lg">
            Oversized graphic tees from the live House of Bollywood catalog.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className={cn(
                "inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold tracking-wide text-accent-foreground transition-colors hover:bg-[#c41010] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
            >
              Shop the drop
            </Link>
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-transparent px-6 text-sm font-semibold tracking-wide text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={() => {
                document
                  .getElementById("tees")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              View tees
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
