"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import Magnet from "@/components/react-bits/Magnet";
import ShinyText from "@/components/react-bits/ShinyText";
import { SplitWords } from "@/components/motion/split-words";
import { siteConfig } from "@/config/site";

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
      <div
        className="pointer-events-none absolute inset-x-4 top-[5.5rem] bottom-4 rounded-[1.25rem] border border-white/20 sm:inset-x-6 sm:top-28 sm:bottom-6 lg:inset-x-8"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[min(90svh,880px)] max-w-[1440px] flex-col justify-end px-6 pb-16 pt-32 sm:px-8 sm:pb-20 lg:justify-center lg:pb-24">
        <div className="max-w-lg text-white">
          <div className="mb-4">
            {reduceMotion ? (
              <p className="text-[10px] font-semibold tracking-[0.28em] text-white/80 uppercase">
                Feature presentation
              </p>
            ) : (
              <ShinyText
                text="FEATURE PRESENTATION"
                speed={2.4}
                color="rgba(255,255,255,0.55)"
                shineColor="#ffffff"
                className="text-[10px] font-semibold tracking-[0.28em]"
              />
            )}
          </div>

          <Image
            src="/brand/house-of-bollywood-logo.png"
            alt={siteConfig.name}
            width={1024}
            height={341}
            priority
            className="h-12 w-auto sm:h-[4.25rem]"
          />

          <SplitWords
            as="h1"
            text="Off screen. On you."
            immediate
            delay={0.06}
            className="mt-7 font-display text-[clamp(3.25rem,10vw,6.75rem)] leading-[0.88] tracking-tight"
          />

          <p className="mt-4 max-w-sm text-sm leading-6 text-white/75 sm:text-base">
            Pop-culture graphic tees from the live catalog. Real drops. Real
            prices. No filler cast.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Magnet
              padding={60}
              magnetStrength={3.5}
              disabled={!!reduceMotion}
              wrapperClassName="inline-flex"
            >
              <Link
                href="/shop"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Shop the board
              </Link>
            </Magnet>
            <a
              href="#tonight"
              className="text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Tonight&apos;s cast
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
