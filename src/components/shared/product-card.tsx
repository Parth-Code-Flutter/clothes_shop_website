"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PreviewNotice } from "@/components/shared/preview-notice";
import { formatInrFromPaise } from "@/lib/money";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const [preview, setPreview] = useState<string | null>(null);
  const href = `/product/${product.slug}`;

  return (
    <>
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
            <h3 className="font-display text-xl tracking-wide text-foreground sm:text-2xl">
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
              onClick={() => setPreview(`Add ${product.name} to cart`)}
            >
              Add to cart
            </Button>
          </div>
        </div>
      </article>
      <PreviewNotice
        open={preview !== null}
        action={preview ?? ""}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
