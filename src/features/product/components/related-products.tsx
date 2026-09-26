"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { productGridClass, ProductCard } from "@/components/shared/product-card";
import type { CatalogProduct } from "@/features/catalog/types";

export function RelatedProducts({ products }: { products: CatalogProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface text-foreground">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24 xl:px-14">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold tracking-[0.25em] text-accent uppercase">Keep the scene going</p>
            <h2 className="mt-3 font-display text-5xl leading-none tracking-wide sm:text-6xl">You may also like.</h2>
          </div>
          <Link href="/shop" className="inline-flex min-h-11 items-center gap-3 self-start text-xs font-bold tracking-[0.12em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:self-auto">View all clothing <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className={`${productGridClass} mt-10`}>
          {products.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
