"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { getAllProducts } from "@/features/catalog/data";
import { formatInrFromPaise } from "@/lib/money";
import { siteConfig } from "@/config/site";

const MARQUEE = [
  siteConfig.tagline,
  siteConfig.name,
  "Graphic Tees",
  "Junagadh",
  "₹650 Drops",
  "Gen Z Closet",
];

export function HomeMarquee() {
  const reduceMotion = useReducedMotion();
  const loop = [...MARQUEE, ...MARQUEE, ...MARQUEE];

  return (
    <section
      aria-label="Brand marquee"
      className="overflow-hidden border-y border-border bg-footer text-footer-foreground"
    >
      <div
        className={
          reduceMotion
            ? "flex gap-10 overflow-x-auto whitespace-nowrap px-4 py-4"
            : "flex w-max animate-marquee gap-10 whitespace-nowrap py-4"
        }
      >
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="font-display text-2xl tracking-[0.18em] uppercase text-footer-foreground/90"
          >
            {item}
            <span className="ml-10 text-accent" aria-hidden="true">
              ●
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}

export function HomeDropStage() {
  const products = getAllProducts();
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="drop-stage"
      className="bg-[#0a0705] py-16 text-white sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
              Character drop stage
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-6xl">
              One poster. One vibe.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/65">
            Swipe the cast. Real tees from the catalog — no fake stock, no
            filler ratings.
          </p>
        </div>
      </div>

      <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-10">
        {products.map((product, index) => (
          <motion.article
            key={product.id}
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: 0.45,
              delay: reduceMotion ? 0 : index * 0.04,
            }}
            className="relative w-[78vw] max-w-sm shrink-0 snap-center overflow-hidden rounded-[2rem] bg-black sm:w-[42vw] lg:w-[28vw]"
          >
            <Link
              href={`/product/${product.slug}`}
              className="group relative block aspect-[700/910] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <Image
                src={product.image}
                alt={product.alt}
                fill
                sizes="(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 28vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-display text-3xl tracking-wide">
                  {product.name}
                </p>
                <p className="mt-1 text-sm text-gold">
                  {formatInrFromPaise(product.pricePaise)}
                </p>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
