"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/features/wishlist/wishlist-provider";
import { getCategoryById } from "@/features/catalog/data";
import { formatInrFromPaise } from "@/lib/money";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: CatalogProduct;
  index?: number;
  featured?: boolean;
};

export function ProductCard({ product }: ProductCardProps) {
  const { hasProduct, toggleProduct } = useWishlist();
  const saved = hasProduct(product.id);
  const href = `/product/${product.slug}`;
  const category = getCategoryById(product.categoryId);

  return (
    <article className="group flex h-full flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f3f0eb] dark:bg-footer">
        <Link
          href={href}
          className="absolute inset-0 block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          aria-label={`View ${product.name}`}
        >
          <Image
            src={product.image}
            alt={product.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </Link>
        <button
          type="button"
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
          aria-pressed={saved}
          onClick={() => toggleProduct(product)}
          className="absolute top-3 right-3 inline-flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <Heart
            className={cn("size-4", saved && "fill-accent text-accent")}
            aria-hidden="true"
          />
        </button>
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
          {category?.name ?? "House"}
        </p>
        <h3 className="mt-1 text-sm font-medium tracking-tight text-foreground">
          <Link
            href={href}
            className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 flex items-baseline gap-2 text-sm">
          <span className="font-medium tabular-nums">
            {formatInrFromPaise(product.pricePaise)}
          </span>
          {product.mrpPaise && product.mrpPaise > product.pricePaise ? (
            <span className="text-xs text-muted line-through tabular-nums">
              {formatInrFromPaise(product.mrpPaise)}
            </span>
          ) : null}
        </p>
      </div>
    </article>
  );
}
