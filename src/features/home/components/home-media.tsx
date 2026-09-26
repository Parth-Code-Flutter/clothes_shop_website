"use client";

import Image from "next/image";
import Link from "next/link";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { getAllProducts } from "@/features/catalog/data";

/** Alternate catalog stills, one frame each, captions always visible. */
export function HomeMedia() {
  const stills = getAllProducts().map((product) => ({
    src: product.gallery[1] ?? product.gallery[0],
    alt: product.alt,
    name: product.name,
    href: `/product/${product.slug}`,
    id: product.id,
  }));

  return (
    <section
      id="media"
      className="bg-background px-6 py-24 text-foreground sm:px-8 sm:py-32 lg:pr-20"
    >
      <div className="mx-auto max-w-[1440px]">
        <RevealOnScroll>
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
            <p className="text-[10px] font-semibold tracking-[0.34em] text-gold uppercase">
              03 — Stills
            </p>
            <p className="max-w-xs text-sm leading-6 text-muted">
              A second frame from each piece in the live catalog.
            </p>
          </div>
          <h2 className="mt-10 max-w-3xl font-display text-5xl leading-[0.92] tracking-tight sm:text-7xl">
            The print, held still.
          </h2>
        </RevealOnScroll>

        <div className="mt-14 -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
          {stills.map((still, index) => (
            <RevealOnScroll
              key={still.id}
              delay={Math.min(index * 0.04, 0.16)}
              className="w-[72vw] shrink-0 snap-start sm:w-[42vw] lg:w-auto"
            >
              <Link
                href={still.href}
                className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <span className="relative block aspect-[3/4] overflow-hidden bg-footer">
                  <Image
                    src={still.src}
                    alt={still.alt}
                    fill
                    sizes="(max-width: 1024px) 70vw, 20vw"
                    className="object-contain object-center p-3 transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </span>
                <span className="mt-3 block font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-1 block text-sm font-semibold tracking-wide">
                  {still.name}
                </span>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
