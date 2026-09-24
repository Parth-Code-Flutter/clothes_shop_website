"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { siteConfig } from "@/config/site";

export function HomeHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate min-h-[min(92svh,920px)] overflow-hidden bg-[#1a3a6e]">
      <Image
        src="/images/homepage/slide-1.png"
        alt="House of Bollywood oversized graphic tees"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[78%_center] sm:object-[70%_center] lg:object-right"
      />

      {/* Soft left wash only — keep the product art readable, not buried */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#102448]/80 via-[#102448]/35 to-transparent sm:via-[#102448]/25"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[min(92svh,920px)] max-w-[1440px] items-end px-6 pb-14 pt-28 sm:px-8 sm:pb-20 lg:items-center lg:pb-24">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md text-white"
        >
          <Image
            src="/brand/house-of-bollywood-logo.png"
            alt={siteConfig.name}
            width={1024}
            height={341}
            priority
            className="h-12 w-auto sm:h-16"
          />
          <h1 className="mt-7 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Big characters.
            <span className="mt-1 block text-white/70">Your kind of style.</span>
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/75 sm:text-base">
            Graphic tees from the live catalog. Shop what&apos;s real — nothing
            invented for the page.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-[#130603] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Shop all tees
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
