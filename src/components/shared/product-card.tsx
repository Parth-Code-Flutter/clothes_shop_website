"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useWishlist } from "@/features/wishlist/wishlist-provider";
import { getCategoryById } from "@/features/catalog/data";
import { formatInrFromPaise } from "@/lib/money";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";
// import { TryOnButton } from "@/features/try-on/virtual-try-on";
import { ProductMedia } from "./product-media";
import styles from "./product-card.module.css";

type ProductCardProps = {
  product: CatalogProduct;
  index?: number;
  featured?: boolean;
  /** "cinema" frames the tile as a film cell for the themed listing pages. */
  variant?: "default" | "cinema";
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
export function ProductCard({ product, index = 0, variant = "default" }: ProductCardProps) {
  const cinema = variant === "cinema";
  const { hasProduct, toggleProduct } = useWishlist();
  const saved = hasProduct(product.id);
  const href = `/product/${product.slug}`;
  const category = getCategoryById(product.categoryId);
  const hasOffer = Boolean(product.mrpPaise && product.mrpPaise > product.pricePaise);
  const off = hasOffer ? discountOff(product.pricePaise, product.mrpPaise!) : 0;

  return (
    <article className={cn("group flex h-full flex-col", cinema && styles.frame)}>
      <ProductMedia
        images={product.gallery}
        alt={product.alt}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        className={cn("aspect-[3/4]", cinema ? styles.media : "bg-[#f3f0eb] dark:bg-footer")}
        imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      >
        <Link
          href={href}
          className="absolute inset-0 block focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-foreground"
          aria-label={`View ${product.name}`}
        />
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
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-background/90 px-2 py-1 text-[10px] font-bold tabular-nums shadow-sm">
          {product.rating.toFixed(1)} <Star className="size-2.5 fill-accent text-accent" aria-hidden="true" />
          <span className="font-normal text-muted">| {product.reviewCount}</span>
        </span>
        {/* Try-on is paused until it works reliably.
        <TryOnButton product={product} compact className="absolute right-2 bottom-2 border-0 bg-background/95 shadow-sm"/> */}
      </ProductMedia>
      <div className={cn("flex flex-1 flex-col pt-2.5", cinema && "px-1")}>
        <p className={cinema ? styles.brand : "truncate text-[13px] font-bold tracking-tight text-foreground"}>
          House
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-[12px] leading-snug font-normal text-muted">
          <Link
            href={href}
            className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[color,background-size] duration-500 group-hover:bg-[length:100%_1px] group-hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground motion-reduce:transition-none"
          >
            {product.name}
            {category ? ` · ${product.color} · ${product.fit}` : ""}
          </Link>
        </h3>
        <p className={cn("flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[13px] leading-none", cinema ? "mt-auto items-center pt-2.5" : "mt-1.5")}>
          <span className={cinema ? styles.ticket : "font-bold tabular-nums text-foreground"}>
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
        {cinema ? (
          <p className={styles.edge} aria-hidden="true">
            <span>HOB {String(index + 1).padStart(2, "0")}</span>
            <span>▸ {category?.name}</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}
