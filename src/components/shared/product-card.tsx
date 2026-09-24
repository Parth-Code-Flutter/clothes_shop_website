"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useState, type MouseEvent } from "react";
import Magnet from "@/components/react-bits/Magnet";
import { useCart } from "@/features/cart/cart-provider";
import { useWishlist } from "@/features/wishlist/wishlist-provider";
import { formatInrFromPaise } from "@/lib/money";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: CatalogProduct;
  index?: number;
  featured?: boolean;
};

export function ProductCard({
  product,
  index,
  featured = false,
}: ProductCardProps) {
  const { addProduct } = useCart();
  const { hasProduct, toggleProduct } = useWishlist();
  const saved = hasProduct(product.id);
  const href = `/product/${product.slug}`;
  const reduceMotion = useReducedMotion();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    addProduct(product, 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <article className="group relative h-full">
      <div
        className={cn(
          "relative h-full overflow-hidden bg-[#0a0705]",
          featured ? "min-h-[420px] sm:min-h-[560px]" : "aspect-[3/4]",
        )}
      >
        <Link
          href={href}
          className="absolute inset-0 block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          aria-label={`View ${product.name}`}
        >
          <Image
            src={product.image}
            alt={product.alt}
            fill
            sizes={
              featured
                ? "(max-width: 640px) 100vw, 66vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <span
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30"
            aria-hidden="true"
          />
        </Link>

        {typeof index === "number" ? (
          <span className="pointer-events-none absolute top-4 left-4 z-[1] font-mono text-[10px] tracking-[0.2em] text-white/70">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}

        <div className="absolute top-3 right-3 z-10">
          <Magnet
            padding={24}
            magnetStrength={3}
            disabled={!!reduceMotion}
            wrapperClassName="block"
          >
            <button
              type="button"
              aria-label={
                saved
                  ? `Remove ${product.name} from wishlist`
                  : `Save ${product.name}`
              }
              aria-pressed={saved}
              onClick={() => toggleProduct(product)}
              className="inline-flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Heart
                className={cn("size-4", saved && "fill-accent text-accent")}
                aria-hidden="true"
              />
            </button>
          </Magnet>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] flex items-end justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0">
            <Link
              href={href}
              className="pointer-events-auto block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <h3
                className={cn(
                  "font-display tracking-wide text-white transition-colors hover:text-white/80",
                  featured ? "text-3xl sm:text-5xl" : "text-2xl sm:text-3xl",
                )}
              >
                {product.name.replace(/ t-?shirt$/i, "")}
              </h3>
            </Link>
            <p className="mt-1 text-sm tabular-nums text-white/75">
              {formatInrFromPaise(product.pricePaise)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            aria-label={
              justAdded ? `${product.name} added` : `Add ${product.name} to bag`
            }
            className="pointer-events-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#130603] transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Plus
              size={18}
              strokeWidth={2.25}
              aria-hidden="true"
              className={cn(
                "transition-transform duration-300",
                justAdded && "rotate-45",
              )}
            />
          </button>
        </div>
      </div>
    </article>
  );
}
