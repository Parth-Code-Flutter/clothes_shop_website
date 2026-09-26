"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";
import { getCategoryById } from "@/features/catalog/data";
import { useWishlist } from "@/features/wishlist/wishlist-provider";
import { formatInrFromPaise } from "@/lib/money";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

export function ProductDetail({ product }: { product: CatalogProduct }) {
  const { addProduct } = useCart();
  const { hasProduct, toggleProduct } = useWishlist();
  const saved = hasProduct(product.id);
  const category = getCategoryById(product.categoryId);
  const gallery = product.gallery.length > 0 ? product.gallery : [product.image];
  const [activeImage, setActiveImage] = useState(gallery[0]!);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (!size) {
      setSizeError(true);
      return;
    }
    addProduct(product, quantity, size);
    setAdded(true);
    setSizeError(false);
  }

  const price = formatInrFromPaise(product.pricePaise);

  return (
    <>
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-8 sm:px-8 sm:py-12 lg:grid-cols-12 lg:gap-14 lg:px-10 lg:py-14">
        <div className="lg:col-span-7">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#f3f0eb] dark:bg-footer sm:aspect-[4/5]">
            <Image
              src={activeImage}
              alt={product.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
          </div>
          {gallery.length > 1 ? (
            <div className="mt-3 flex gap-2">
              {gallery.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(src)}
                  aria-label={`Show photo ${index + 1}`}
                  aria-pressed={activeImage === src}
                  className={cn(
                    "relative aspect-[3/4] w-16 overflow-hidden bg-[#f3f0eb] focus-visible:outline-2 sm:w-20",
                    activeImage === src ? "ring-1 ring-foreground" : "opacity-70",
                  )}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
            <Link href="/shop" className="hover:text-foreground">Shop</Link>
            <span aria-hidden="true">/</span>
            {category ? (
              <Link href={`/shop?category=${category.id}`} className="hover:text-foreground">
                {category.name}
              </Link>
            ) : null}
          </nav>
          <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 flex items-baseline gap-3">
            <span className="text-xl tabular-nums">{price}</span>
            {product.mrpPaise && product.mrpPaise > product.pricePaise ? (
              <span className="text-sm text-muted line-through tabular-nums">
                {formatInrFromPaise(product.mrpPaise)}
              </span>
            ) : null}
          </p>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted">{product.summary}</p>

          <fieldset className="mt-8">
            <legend className="text-[10px] font-semibold tracking-[0.2em] text-muted uppercase">
              Size {size ? `· ${size}` : ""}
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((option) => {
                const selected = size === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setSize(option);
                      setSizeError(false);
                      setAdded(false);
                    }}
                    className={cn(
                      "inline-flex h-11 min-w-11 items-center justify-center border px-3 text-sm",
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {sizeError ? (
              <p className="mt-2 text-sm text-accent" role="alert">
                Select a size to add this piece.
              </p>
            ) : null}
          </fieldset>

          <div className="mt-6 inline-flex items-center border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              className="inline-flex size-12 items-center justify-center"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span className="min-w-10 text-center text-sm tabular-nums">{quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              className="inline-flex size-12 items-center justify-center"
              onClick={() => setQuantity((value) => value + 1)}
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 hidden gap-3 sm:grid">
            <Button className="w-full bg-foreground text-background hover:bg-foreground/85" onClick={handleAdd}>
              <ShoppingBag className="mr-2 size-4" aria-hidden="true" />
              {added ? "Added to bag" : "Add to bag"}
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => toggleProduct(product)}>
              <Heart className={cn("mr-2 size-4", saved && "fill-accent text-accent")} aria-hidden="true" />
              {saved ? "Saved" : "Save to wishlist"}
            </Button>
          </div>
          {added ? (
            <p className="mt-3 hidden text-sm text-muted sm:block" role="status">
              {product.name}, size {size}, is in your bag.{" "}
              <Link href="/cart" className="font-medium text-foreground underline-offset-4 hover:underline">
                Open bag
              </Link>
            </p>
          ) : null}

          <dl className="mt-10 divide-y divide-border border-y border-border text-sm">
            <div className="flex justify-between gap-6 py-3">
              <dt className="text-muted">Fit</dt>
              <dd>Regular, true to the size chart</dd>
            </div>
            <div className="flex justify-between gap-6 py-3">
              <dt className="text-muted">Delivery</dt>
              <dd>Sample storefront — checkout does not ship yet</dd>
            </div>
            <div className="flex justify-between gap-6 py-3">
              <dt className="text-muted">Returns</dt>
              <dd>Preview only</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="text-sm tabular-nums">{price}</p>
          </div>
          <Button className="shrink-0 bg-foreground px-5 text-background hover:bg-foreground/85" onClick={handleAdd}>
            {added ? "Added" : "Add to bag"}
          </Button>
        </div>
        {sizeError ? (
          <p className="mt-2 text-xs text-accent" role="alert">Select a size first.</p>
        ) : null}
      </div>
      <div className="h-24 sm:hidden" aria-hidden="true" />
    </>
  );
}
