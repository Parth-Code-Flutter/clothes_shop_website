"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shared/product-card";
import { productGridClass } from "@/components/shared/product-grid";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";
import styles from "./product-detail.module.css";

export function RelatedProducts({ products }: { products: CatalogProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border text-foreground">
      <div className="mx-auto max-w-[1440px] px-4 pt-16 pb-24 sm:px-8 sm:pt-20 lg:px-10 lg:pt-24 lg:pb-28 xl:px-14">
        <div className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={styles.eyebrow}>Keep the scene going</p>
            <h2 className="mt-3 font-display text-5xl leading-none tracking-wide uppercase sm:text-6xl">Also showing</h2>
          </div>
          <Link href="/shop" className="inline-flex min-h-11 items-center gap-3 self-start text-xs font-bold tracking-[0.12em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:self-auto">View all clothing <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className={cn(productGridClass, "mt-10 gap-y-14 sm:gap-y-16 xl:grid-cols-4 xl:gap-x-6")}>
          {products.map((item, index) => (
            <ProductCard key={item.id} product={item} index={index + 1} variant="cinema" />
          ))}
        </div>
      </div>
    </section>
  );
}
