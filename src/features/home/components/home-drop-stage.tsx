"use client";

import Image from "next/image";
import Link from "next/link";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { getAllProducts } from "@/features/catalog/data";
import { formatInrFromPaise } from "@/lib/money";

/**
 * Cast chapters — section chrome follows theme; type on photos stays light.
 */
export function HomeDropStage() {
  const products = getAllProducts();

  return (
    <section id="cast" className="bg-background text-foreground">
      <div className="mx-auto max-w-[1440px] px-6 pt-20 sm:px-8 sm:pt-24">
        <RevealOnScroll>
          <p className="text-[10px] font-semibold tracking-[0.32em] text-accent uppercase">
            The cast
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl tracking-tight sm:text-6xl">
            Only in the house.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted">
            Five live graphic tees. Tap a character — open the drop.
          </p>
        </RevealOnScroll>
      </div>

      <div className="mt-12 space-y-3 px-3 pb-6 sm:px-5 sm:pb-10 lg:px-8">
        {products.map((product, index) => (
          <RevealOnScroll key={product.id} delay={Math.min(index * 0.04, 0.16)}>
            <Link
              href={`/product/${product.slug}`}
              className="group relative block min-h-[70svh] overflow-hidden bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent lg:min-h-[78svh]"
            >
              <Image
                src={product.image}
                alt={product.alt}
                fill
                sizes="100vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute inset-0 flex flex-col justify-between p-6 text-white sm:p-10 lg:p-14">
                <p className="font-mono text-[10px] tracking-[0.28em] text-white/50 uppercase">
                  Character {String(index + 1).padStart(2, "0")}
                </p>
                <div className="max-w-xl">
                  <h3 className="font-display text-5xl tracking-wide sm:text-7xl lg:text-8xl">
                    {product.name.replace(/ T-?shirt/i, "")}
                  </h3>
                  <p className="mt-3 text-sm text-white/65 sm:text-base">
                    {formatInrFromPaise(product.pricePaise)} · Graphic tee
                  </p>
                  <span className="mt-6 inline-flex text-sm font-semibold tracking-wide text-accent">
                    View drop →
                  </span>
                </div>
              </div>
            </Link>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}

export function HomeMarquee() {
  return null;
}
