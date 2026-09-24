"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Minus,
  Plus,
  Share2,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";
import { useReducedMotion } from "motion/react";
import BlurText from "@/components/react-bits/BlurText";
import { Button } from "@/components/ui/button";
import { PreviewNotice } from "@/components/shared/preview-notice";
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
  const reduceMotion = useReducedMotion();
  const gallery =
    product.gallery.length > 0 ? product.gallery : [product.image];
  const [activeImage, setActiveImage] = useState(gallery[0]!);
  const [imageVisible, setImageVisible] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  function selectImage(src: string) {
    if (src === activeImage) return;
    if (reduceMotion) {
      setActiveImage(src);
      return;
    }
    setImageVisible(false);
    window.setTimeout(() => {
      setActiveImage(src);
      setImageVisible(true);
    }, 180);
  }

  function handleAdd() {
    addProduct(product, quantity);
    setAdded(true);
  }

  const price = formatInrFromPaise(product.pricePaise);

  return (
    <>
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-8 sm:px-8 sm:py-12 lg:grid-cols-12 lg:gap-12 lg:px-10 lg:py-14">
        <div className="lg:col-span-7">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-muted uppercase"
          >
            <Link
              href="/shop"
              className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              Shop
            </Link>
            <span aria-hidden="true">/</span>
            {category ? (
              <>
                <Link
                  href={`/shop?category=${category.id}`}
                  className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                >
                  {category.name}
                </Link>
                <span aria-hidden="true">/</span>
              </>
            ) : null}
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="relative aspect-[700/910] overflow-hidden bg-surface">
            <Image
              key={activeImage}
              src={activeImage}
              alt={product.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className={cn(
                "object-cover transition-opacity duration-300 ease-out",
                imageVisible ? "opacity-100" : "opacity-0",
              )}
            />
          </div>

          {gallery.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:mt-4 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible">
              {gallery.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => selectImage(src)}
                  aria-label={`Show photo ${index + 1}`}
                  aria-pressed={activeImage === src}
                  className={cn(
                    "relative aspect-[700/910] w-20 shrink-0 overflow-hidden bg-surface transition-[box-shadow,opacity] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:w-auto",
                    activeImage === src
                      ? "ring-1 ring-foreground ring-offset-2 ring-offset-background"
                      : "opacity-70 hover:opacity-100",
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

        <div className="flex flex-col lg:col-span-5 lg:sticky lg:top-28 lg:self-start lg:pb-8">
          <p className="text-[10px] font-semibold tracking-[0.28em] text-muted uppercase">
            {category?.name ?? "Drop"}
          </p>

          <BlurText
            as="h1"
            text={product.name}
            delay={80}
            className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          />

          <p className="mt-5 text-2xl tabular-nums text-foreground">{price}</p>

          <p className="mt-5 max-w-md text-sm leading-7 text-muted">
            {product.summary}
          </p>

          <div className="mt-8 inline-flex w-fit items-center border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              className="inline-flex size-12 items-center justify-center text-foreground transition-colors hover:bg-foreground/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span className="min-w-12 text-center text-sm font-semibold tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              className="inline-flex size-12 items-center justify-center text-foreground transition-colors hover:bg-foreground/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              onClick={() => setQuantity((value) => value + 1)}
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 hidden flex-col gap-3 sm:flex">
            <Button className="w-full" onClick={handleAdd}>
              <ShoppingBag className="mr-2 size-4" aria-hidden="true" />
              {added ? "Added to bag" : "Add to bag"}
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                handleAdd();
                setPreview(`Buy ${product.name} now`);
              }}
            >
              Buy now
            </Button>
          </div>

          {added ? (
            <p className="mt-3 hidden text-sm text-muted sm:block" role="status">
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
              onClick={() => toggleProduct(product)}
            >
              <Heart
                className={cn("mr-2 size-4", saved && "fill-accent text-accent")}
                aria-hidden="true"
              />
              {saved ? "Saved" : "Wishlist"}
            </Button>
            <Button
              variant="ghost"
              className="border border-border"
              onClick={() => setPreview(`Share ${product.name}`)}
            >
              <Share2 className="mr-2 size-4" aria-hidden="true" />
              Share
            </Button>
          </div>

          <div className="mt-10 space-y-4 border-t border-border pt-6 text-sm leading-6 text-muted">
            <p>
              Size and stock details are not shown here because they were not
              verified on the live product page.
            </p>
            <p>
              <Link
                href="/shop"
                className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
              >
                ← Back to shop
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Mobile sticky ATC */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
              {product.name}
            </p>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {price}
            </p>
          </div>
          <Button className="shrink-0 px-5" onClick={handleAdd}>
            {added ? "Added" : "Add to bag"}
          </Button>
        </div>
      </div>
      <div className="h-20 sm:hidden" aria-hidden="true" />

      <PreviewNotice
        open={preview !== null}
        action={preview ?? ""}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
