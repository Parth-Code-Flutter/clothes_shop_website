"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";
import { getProductBySlug } from "@/features/catalog/data";
import { useWishlist } from "@/features/wishlist/wishlist-provider";
import { formatInrFromPaise } from "@/lib/money";

export function WishlistView() {
  const { items, count, removeProduct, clearWishlist } = useWishlist();
  const { addProduct } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6">
        <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
          Wishlist
        </p>
        <h1 className="mt-3 font-display text-5xl tracking-tight text-foreground sm:text-6xl">
          No saves yet
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-muted">
          Tap the heart on a drop and it parks here on this device.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Browse the drop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
            Wishlist
          </p>
          <h1 className="mt-3 font-display text-5xl tracking-tight text-foreground">
            {count} saved {count === 1 ? "piece" : "pieces"}
          </h1>
        </div>
        <button
          type="button"
          onClick={clearWishlist}
          className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Clear saves
        </button>
      </div>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const product = getProductBySlug(item.slug);
          return (
            <li
              key={item.productId}
              className="flex flex-col overflow-hidden rounded-3xl border border-border bg-surface"
            >
              <Link
                href={`/product/${item.slug}`}
                className="relative aspect-[700/910] bg-[#0a0705] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-display text-2xl tracking-wide text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {formatInrFromPaise(item.pricePaise)}
                  </p>
                </div>
                <div className="mt-auto flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="w-full sm:flex-1"
                    disabled={!product}
                    onClick={() => {
                      if (product) addProduct(product, 1);
                    }}
                  >
                    Add to bag
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full border border-border sm:w-auto"
                    onClick={() => removeProduct(item.productId)}
                  >
                    <Trash2 className="mr-2 size-4" aria-hidden="true" />
                    Remove
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 flex items-center gap-2 text-xs text-muted">
        <Heart className="size-3.5 text-accent" aria-hidden="true" />
        Saves stay on this device until account sync exists.
      </p>
    </div>
  );
}
