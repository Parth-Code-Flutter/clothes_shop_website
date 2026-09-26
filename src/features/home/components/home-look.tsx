"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { SplitWords } from "@/components/motion/split-words";

const BOARDS = [
  {
    src: "/images/homepage/slide-1.png",
    label: "Board 01",
    title: "Vengeance red",
    note: "Black and red, shot as a pair.",
  },
  {
    src: "/images/homepage/slide-2.png",
    label: "Board 02",
    title: "Yellow & green",
    note: "The second frame from the same drop.",
  },
] as const;

/** Campaign spread after the scroll hero. Photo type stays light on the image. */
export function HomeLook() {
  return (
    <section
      id="look"
      className="bg-background px-6 py-24 text-foreground sm:px-8 sm:py-32 lg:pr-20"
    >
      <div className="mx-auto max-w-[1440px]">
        <RevealOnScroll>
          <div className="flex items-end justify-between gap-6 border-b border-border pb-6">
            <p className="text-[10px] font-semibold tracking-[0.34em] text-gold uppercase">
              01 — Campaign
            </p>
            <p className="hidden text-[10px] tracking-[0.28em] text-muted uppercase sm:block">
              House of Bollywood
            </p>
          </div>
          <SplitWords
            as="h2"
            text="Two frames. One house."
            className="mt-10 max-w-4xl font-display text-5xl leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl"
          />
        </RevealOnScroll>

        <div className="mt-14 grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <RevealOnScroll className="lg:col-span-7">
            <figure>
              <div className="relative aspect-[16/10] overflow-hidden bg-footer">
                <Image
                  src={BOARDS[0].src}
                  alt={BOARDS[0].title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover object-[72%_center]"
                />
              </div>
              <figcaption className="mt-4 flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase">
                    {BOARDS[0].label}
                  </p>
                  <p className="mt-1 font-display text-2xl tracking-wide sm:text-3xl">
                    {BOARDS[0].title}
                  </p>
                </div>
                <p className="max-w-[12rem] text-right text-xs leading-5 text-muted">
                  {BOARDS[0].note}
                </p>
              </figcaption>
            </figure>
          </RevealOnScroll>

          <RevealOnScroll delay={0.08} className="lg:col-span-5 lg:pt-24">
            <figure>
              <div className="relative aspect-[16/11] overflow-hidden bg-footer">
                <Image
                  src={BOARDS[1].src}
                  alt={BOARDS[1].title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-[72%_center]"
                />
              </div>
              <figcaption className="mt-4">
                <p className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase">
                  {BOARDS[1].label}
                </p>
                <p className="mt-1 font-display text-2xl tracking-wide sm:text-3xl">
                  {BOARDS[1].title}
                </p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                  {BOARDS[1].note} Oversized silhouettes from the live catalog — no filler stock.
                </p>
              </figcaption>
            </figure>
            <Link
              href="#cast"
              className="mt-8 inline-flex min-h-12 items-center gap-2 text-sm font-semibold tracking-wide text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Continue to the edit
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
