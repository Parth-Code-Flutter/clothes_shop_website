"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { getAllProducts } from "@/features/catalog/data";
import { formatInrFromPaise } from "@/lib/money";
import { siteConfig } from "@/config/site";

const MARQUEE = [
  siteConfig.name,
  "Graphic tees",
  "Junagadh",
  "Pop culture",
  "Personal style",
];

export function HomeMarquee() {
  const reduceMotion = useReducedMotion();
  const loop = [...MARQUEE, ...MARQUEE, ...MARQUEE];

  return (
    <section
      aria-label="Brand marquee"
      className="overflow-hidden border-y border-border bg-background"
    >
      <div
        className={
          reduceMotion
            ? "flex gap-10 overflow-x-auto whitespace-nowrap px-4 py-3.5"
            : "flex w-max animate-marquee gap-10 whitespace-nowrap py-3.5"
        }
      >
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="text-xs font-semibold tracking-[0.22em] text-muted uppercase"
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
    <section id="the-cast" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] text-foreground uppercase">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              The cast
            </p>
            <h2 className="max-w-lg text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
              Pick a character. Make it yours.
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            See all →
          </Link>
        </div>
      </div>

      <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-1 sm:gap-5 sm:px-8">
        {products.map((product, index) => (
          <motion.article
            key={product.id}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.4,
              delay: reduceMotion ? 0 : index * 0.04,
            }}
            className="w-[72vw] max-w-xs shrink-0 snap-center sm:w-[38vw] lg:w-[22vw]"
          >
            <Link
              href={`/product/${product.slug}`}
              className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              <div className="relative aspect-[700/910] overflow-hidden bg-surface">
                <Image
                  src={product.image}
                  alt={product.alt}
                  fill
                  sizes="(max-width: 640px) 72vw, (max-width: 1024px) 38vw, 22vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  {product.name}
                </p>
                <p className="shrink-0 text-sm text-muted">
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
