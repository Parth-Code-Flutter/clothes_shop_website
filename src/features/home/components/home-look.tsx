"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import Magnet from "@/components/react-bits/Magnet";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { SplitWords } from "@/components/motion/split-words";

/** “An Extended Look” — dual trailer stills like Rockstar media blocks. */
export function HomeLook() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="look" className="bg-[#05070f] px-6 py-20 text-white sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1440px]">
        <RevealOnScroll>
          <p className="text-[10px] font-semibold tracking-[0.32em] text-accent uppercase">
            An extended look
          </p>
          <SplitWords
            as="h2"
            text="Two frames. One house."
            className="mt-4 max-w-3xl font-display text-4xl tracking-tight sm:text-6xl lg:text-7xl"
          />
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/60">
            Campaign boards from the live drop — oversized silhouettes, character
            backs, no filler stock.
          </p>
        </RevealOnScroll>

        <div className="mt-12 grid gap-4 lg:grid-cols-2 lg:gap-5">
          {[
            {
              src: "/images/homepage/slide-1.png",
              label: "Board 01",
              title: "Vengeance red",
            },
            {
              src: "/images/homepage/slide-2.png",
              label: "Board 02",
              title: "Yellow & green",
            },
          ].map((board, index) => (
            <RevealOnScroll key={board.src} delay={index * 0.08}>
              <figure className="group relative aspect-[16/10] overflow-hidden bg-black">
                <Image
                  src={board.src}
                  alt={board.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black via-black/50 to-transparent p-5 sm:p-6">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase">
                      {board.label}
                    </p>
                    <p className="mt-1 font-display text-2xl tracking-wide sm:text-3xl">
                      {board.title}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </RevealOnScroll>
          ))}
        </div>

        <div className="mt-10">
          <Magnet padding={40} magnetStrength={3.5} disabled={!!reduceMotion}>
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-7 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Shop the board
            </Link>
          </Magnet>
        </div>
      </div>
    </section>
  );
}
