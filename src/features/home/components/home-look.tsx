"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import Magnet from "@/components/react-bits/Magnet";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { SplitWords } from "@/components/motion/split-words";

export function HomeLook() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-[#163568]">
      <div className="mx-auto grid min-h-[min(72svh,700px)] max-w-[1440px] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative order-2 min-h-[44vh] lg:order-1 lg:min-h-full">
          <Image
            src="/images/homepage/slide-2.png"
            alt="Yellow Batman and Hulk graphic tees from the catalog"
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover object-[70%_center]"
          />
        </div>

        <div className="order-1 flex flex-col justify-center bg-background px-6 py-14 sm:px-10 sm:py-20 lg:order-2">
          <RevealOnScroll className="max-w-md">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              Intermission
            </p>
            <SplitWords
              as="h2"
              text="Same house. New frame."
              className="font-display text-5xl leading-[0.92] tracking-tight text-foreground sm:text-6xl"
            />
            <p className="mt-4 text-sm leading-6 text-muted">
              Second slide from the campaign board — yellow bats, green rage,
              and whatever you pick next.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Magnet padding={40} magnetStrength={3.5} disabled={!!reduceMotion}>
                <Link
                  href="/shop"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  Open shop
                </Link>
              </Magnet>
              <Link
                href="/search"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border px-7 text-sm font-semibold text-foreground transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
              >
                Search cast
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
