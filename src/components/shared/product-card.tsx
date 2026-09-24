"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";
import { getCategoryById } from "@/features/catalog/data";
import { formatInrFromPaise } from "@/lib/money";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { addProduct } = useCart();
  const href = `/product/${product.slug}`;
  const category = getCategoryById(product.categoryId);

  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        className="relative aspect-[700/910] overflow-hidden bg-[#0a0705] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <Image
          src={product.image}
          alt={product.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </Link>
      <div className="mt-4 flex flex-1 flex-col gap-3">
        <div>
          {category ? (
            <p className="text-[11px] font-semibold tracking-[0.2em] text-gold uppercase">
              {category.name}
            </p>
          ) : null}
          <h3 className="mt-1 font-display text-xl tracking-wide text-foreground sm:text-2xl">
            <Link
              href={href}
              className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted">
            {formatInrFromPaise(product.pricePaise)}
          </p>
        </div>
        <div className="mt-auto flex flex-col gap-2 sm:flex-row">
          <Link
            href={href}
            className={cn(
              "inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface px-6 text-sm font-semibold tracking-wide text-foreground transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            )}
          >
            View
          </Link>
          <Button
            variant="ghost"
            className="w-full border border-border sm:w-auto"
            onClick={() => addProduct(product, 1)}
          >
            Add to bag
          </Button>
        </div>
      </div>
    </article>
  );
}
