"use client";

import { ProductCard } from "@/components/shared/product-card";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { SplitWords } from "@/components/motion/split-words";
import type { CatalogProduct } from "@/features/catalog/types";

export function RelatedProducts({ products }: { products: CatalogProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border px-4 py-14 sm:px-8 sm:py-16 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <p className="text-[10px] font-semibold tracking-[0.28em] text-muted uppercase">
          Keep looking
        </p>
        <SplitWords
          as="h2"
          text="You may also like"
          className="mt-3 font-display text-3xl tracking-tight text-foreground sm:text-4xl lg:text-5xl"
        />
        <div className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((item, index) => (
            <RevealOnScroll
              key={item.id}
              delay={Math.min(index * 0.05, 0.2)}
              y={32}
            >
              <ProductCard product={item} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
