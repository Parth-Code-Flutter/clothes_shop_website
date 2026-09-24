"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ProductCard } from "@/components/shared/product-card";
import { homepageProducts } from "@/features/home/data";

export function HomeProducts() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="tees" className="bg-background px-6 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              Full board
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
              Every live tee
            </h2>
          </div>
          <Link
            href="/search"
            className="text-sm font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            Search catalog →
          </Link>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {homepageProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.04,
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
