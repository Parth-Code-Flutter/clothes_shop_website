"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

/**
 * Inspiration: Dribbble editorial fashion heroes + Pinterest campaign lands.
 * Cinema title-card tone matches the header “Now showing” strip.
 * Soft wash only — product art stays the star.
 */

const SLIDES = [
  {
    src: "/images/homepage/slide-1.png",
    alt: "House of Bollywood oversized graphic tees on a blue field",
  },
  {
    src: "/images/homepage/slide-2.png",
    alt: "More House of Bollywood graphic tee drops on a blue field",
  },
] as const;

export function HomeHero() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <section className="relative isolate min-h-[min(90svh,880px)] overflow-hidden bg-[#163568]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={SLIDES[index].src}
          className="absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={SLIDES[index].src}
            alt={SLIDES[index].alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-[78%_center] sm:object-[70%_center] lg:object-right"
          />
        </motion.div>
      </AnimatePresence>

      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0d2248]/78 via-[#0d2248]/28 to-transparent"
        aria-hidden="true"
      />

      {/* Decorative reel frame — edges only, no clutter on the product */}
      <div
        className="pointer-events-none absolute inset-x-4 top-[5.5rem] bottom-4 rounded-[1.25rem] border border-white/20 sm:inset-x-6 sm:top-28 sm:bottom-6 lg:inset-x-8"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[min(90svh,880px)] max-w-[1440px] flex-col justify-end px-6 pb-16 pt-32 sm:px-8 sm:pb-20 lg:justify-center lg:pb-24">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg text-white"
        >
          <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.28em] uppercase">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Feature presentation
          </p>

          <Image
            src="/brand/house-of-bollywood-logo.png"
            alt={siteConfig.name}
            width={1024}
            height={341}
            priority
            className="mt-5 h-12 w-auto sm:h-[4.25rem]"
          />

          <h1 className="mt-7 font-display text-[clamp(3.25rem,10vw,6.75rem)] leading-[0.88] tracking-tight">
            Off screen.
            <span className="block text-white/55">On you.</span>
          </h1>

          <p className="mt-4 max-w-sm text-sm leading-6 text-white/75 sm:text-base">
            Pop-culture graphic tees from the live catalog. Real drops. Real
            prices. No filler cast.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Shop the board
            </Link>
            <a
              href="#tonight"
              className="text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Tonight&apos;s cast
            </a>
          </div>
        </motion.div>

        {!reduceMotion ? (
          <div
            className="absolute right-6 bottom-8 flex gap-2 sm:right-8"
            aria-hidden="true"
          >
            {SLIDES.map((slide, slideIndex) => (
              <span
                key={slide.src}
                className={
                  slideIndex === index
                    ? "h-1 w-8 rounded-full bg-accent"
                    : "h-1 w-3 rounded-full bg-white/35"
                }
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
