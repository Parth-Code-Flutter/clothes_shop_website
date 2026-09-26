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

/**
 * Browse-first grid — enough pieces on screen to compare, like a shop PLP.
 * 2 → 3 → 4 → 5 columns as the viewport grows.
 */
export const productGridClass =
  "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-4 xl:grid-cols-5";

function discountOff(pricePaise: number, mrpPaise: number) {
  return Math.round(((mrpPaise - pricePaise) / mrpPaise) * 100);
}

/** Compact product tile: image, brand, name, price + % off. Built for scanning. */
export function ProductCard({ product }: ProductCardProps) {
  const { hasProduct, toggleProduct } = useWishlist();
  const saved = hasProduct(product.id);
  const href = `/product/${product.slug}`;
  const category = getCategoryById(product.categoryId);
  const hasOffer = Boolean(product.mrpPaise && product.mrpPaise > product.pricePaise);
  const off = hasOffer ? discountOff(product.pricePaise, product.mrpPaise!) : 0;

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
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </Link>
        <button
          type="button"
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
          aria-pressed={saved}
          onClick={() => toggleProduct(product)}
          className={cn(
            "absolute top-2 right-2 inline-flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-opacity focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
            saved
              ? "opacity-100"
              : "opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100",
          )}
        >
          <Heart className={cn("size-3.5", saved && "fill-foreground")} aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-1 flex-col pt-2.5">
        <p className="truncate text-[13px] font-bold tracking-tight text-foreground">
          House
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-[12px] leading-snug font-normal text-muted">
          <Link
            href={href}
            className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            {product.name}
            {category ? ` · ${category.name}` : ""}
          </Link>
        </h3>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[13px] leading-none">
          <span className="font-bold tabular-nums text-foreground">
            {formatInrFromPaise(product.pricePaise)}
          </span>
          {hasOffer ? (
            <>
              <span className="text-[12px] text-muted line-through tabular-nums">
                {formatInrFromPaise(product.mrpPaise!)}
              </span>
              <span className="text-[12px] font-semibold text-accent tabular-nums">
                ({off}% OFF)
              </span>
            </>
          ) : null}
        </p>
      </div>
    </article>
  );
}
