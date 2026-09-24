"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PreviewNotice } from "@/components/shared/preview-notice";
import { formatInrFromPaise } from "@/lib/money";
import type { HomepageProduct } from "@/features/home/types";

export function ProductCard({ product }: { product: HomepageProduct }) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <>
      <article className="group flex flex-col">
        <button
          type="button"
          onClick={() => setPreview(product.name)}
          className="relative aspect-[700/910] overflow-hidden bg-[#0a0705] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <Image
            src={product.image}
            alt={product.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </button>
        <div className="mt-4 flex flex-1 flex-col gap-3">
          <div>
            <h3 className="font-display text-xl tracking-wide text-foreground sm:text-2xl">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {formatInrFromPaise(product.pricePaise)}
            </p>
          </div>
          <Button
            variant="secondary"
            className="mt-auto w-full sm:w-auto"
            onClick={() => setPreview(`Add ${product.name} to cart`)}
          >
            Add to cart
          </Button>
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
