"use client";

import { motion, useReducedMotion } from "motion/react";
import { ProductCard } from "@/components/shared/product-card";
import { homepageProducts } from "@/features/home/data";

export function HomeProducts() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="tees" className="bg-background px-4 py-16 sm:px-6 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
              Catalog
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
              Full drop board
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted">
            Same live tees in a clean grid. Open shop for categories, or search
            when you already know the name.
          </p>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {homepageProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.45,
                delay: reduceMotion ? 0 : index * 0.05,
                ease: [0.22, 1, 0.36, 1],
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
