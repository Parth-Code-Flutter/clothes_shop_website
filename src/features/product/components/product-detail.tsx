"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PreviewNotice } from "@/components/shared/preview-notice";
import { useCart } from "@/features/cart/cart-provider";
import { getCategoryById } from "@/features/catalog/data";
import { formatInrFromPaise } from "@/lib/money";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

export function ProductDetail({ product }: { product: CatalogProduct }) {
  const { addProduct } = useCart();
  const category = getCategoryById(product.categoryId);
  const [activeImage, setActiveImage] = useState(
    product.gallery[0] ?? product.image,
  );
  const [quantity, setQuantity] = useState(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addProduct(product, quantity);
    setAdded(true);
  }

  return (
    <>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <div>
          <div className="relative aspect-[700/910] overflow-hidden bg-[#0a0705]">
            <Image
              src={activeImage}
              alt={product.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {product.gallery.length > 1 ? (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.gallery.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(src)}
                  aria-label="Show product photo"
                  aria-pressed={activeImage === src}
                  className={cn(
                    "relative aspect-[700/910] overflow-hidden bg-[#0a0705] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    activeImage === src &&
                      "ring-2 ring-accent ring-offset-2 ring-offset-background",
                  )}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
            {category?.name ?? "Drop"}
          </p>
          <h1 className="mt-3 font-display text-5xl tracking-tight text-foreground sm:text-6xl">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl text-foreground">
            {formatInrFromPaise(product.pricePaise)}
          </p>
          <p className="mt-5 max-w-lg text-sm leading-7 text-muted">
            {product.summary}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="inline-flex h-12 w-12 items-center justify-center text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <span className="min-w-10 text-center text-sm font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="inline-flex h-12 w-12 items-center justify-center text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={() => setQuantity((value) => value + 1)}
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button className="w-full sm:flex-1" onClick={handleAdd}>
              {added ? "Added to bag" : "Add to bag"}
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:flex-1"
              onClick={() => {
                handleAdd();
                setPreview(`Buy ${product.name} now`);
              }}
            >
              Buy now
            </Button>
          </div>
          {added ? (
            <p className="mt-3 text-sm text-muted" role="status">
              In your bag.{" "}
              <Link
                href="/cart"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Open bag
              </Link>
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="ghost"
              className="border border-border"
              onClick={() => setPreview(`Wishlist ${product.name}`)}
            >
              <Heart className="mr-2 size-4" aria-hidden="true" />
              Wishlist
            </Button>
            <Button
              variant="ghost"
              className="border border-border"
              onClick={() => setPreview(`Share ${product.name}`)}
            >
              <Share2 className="mr-2 size-4" aria-hidden="true" />
              Share
            </Button>
            <Button
              variant="ghost"
              className="border border-border"
              onClick={() => setPreview(`Ask about ${product.name}`)}
            >
              Ask us
            </Button>
          </div>

          <div className="mt-10 border-t border-border pt-6 text-sm text-muted">
            <p>
              <Link
                href="/shop"
                className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Back to shop
              </Link>
            </p>
            <p className="mt-3">
              Size and stock details are not shown here because they were not
              verified on the live product page.
            </p>
          </div>
        </div>
      </div>

      <PreviewNotice
        open={preview !== null}
        action={preview ?? ""}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
