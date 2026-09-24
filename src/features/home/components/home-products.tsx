"use client";

import Link from "next/link";
import { ProductCard } from "@/components/shared/product-card";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import BlurText from "@/components/react-bits/BlurText";
import { homepageProducts } from "@/features/home/data";

export function HomeProducts() {
  return (
    <section id="tees" className="bg-background px-6 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              Full screening
            </p>
            <BlurText
              text="Every live tee"
              as="h2"
              delay={90}
              className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl"
            />
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
            <RevealOnScroll
              key={product.id}
              delay={Math.min(index * 0.04, 0.2)}
            >
              <ProductCard product={product} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
