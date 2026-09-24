"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreviewNotice } from "@/components/shared/preview-notice";
import { useCart } from "@/features/cart/cart-provider";
import { formatInrFromPaise } from "@/lib/money";
import { useState } from "react";

export function CartView() {
  const { lines, itemCount, subtotalPaise, setQuantity, removeLine, clearCart } =
    useCart();
  const [preview, setPreview] = useState<string | null>(null);

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6">
        <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
          Your bag
        </p>
        <h1 className="mt-3 font-display text-5xl tracking-tight text-foreground sm:text-6xl">
          Empty for now
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-muted">
          Pull a graphic tee from the shop and it lands here. More categories
          are coming — hoodies, accessories, limited drops.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Shop the drop
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.4fr_0.8fr] lg:px-10">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
                Your bag
              </p>
              <h1 className="mt-3 font-display text-5xl tracking-tight text-foreground">
                {itemCount} {itemCount === 1 ? "piece" : "pieces"}
              </h1>
            </div>
            <button
              type="button"
              onClick={clearCart}
              className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Clear bag
            </button>
          </div>

          <ul className="divide-y divide-border">
            {lines.map((line) => (
              <li
                key={line.productId}
                className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center"
              >
                <Link
                  href={`/product/${line.slug}`}
                  className="relative h-36 w-28 shrink-0 overflow-hidden bg-[#0a0705] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <Image
                    src={line.image}
                    alt={line.alt}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/product/${line.slug}`}
                        className="font-display text-2xl tracking-wide text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                      >
                        {line.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted">
                        {formatInrFromPaise(line.pricePaise)} each
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {formatInrFromPaise(line.pricePaise * line.quantity)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-border">
                      <button
                        type="button"
                        aria-label={`Decrease ${line.name}`}
                        className="inline-flex h-11 w-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        onClick={() =>
                          setQuantity(line.productId, line.quantity - 1)
                        }
                      >
                        <Minus className="size-4" aria-hidden="true" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${line.name}`}
                        className="inline-flex h-11 w-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        onClick={() =>
                          setQuantity(line.productId, line.quantity + 1)
                        }
                      >
                        <Plus className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${line.name}`}
                      onClick={() => removeLine(line.productId)}
                      className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm text-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-3xl border border-border bg-surface p-6 lg:sticky lg:top-28">
          <p className="font-display text-3xl tracking-wide text-foreground">
            Order vibe check
          </p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-foreground">
                {formatInrFromPaise(subtotalPaise)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Shipping</dt>
              <dd className="text-muted">Set at checkout</dd>
            </div>
          </dl>
          <Button
            className="mt-8 w-full"
            onClick={() => setPreview("Checkout")}
          >
            Checkout
          </Button>
          <Link
            href="/shop"
            className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Keep shopping
          </Link>
          <p className="mt-4 text-xs leading-5 text-muted">
            Bag is saved on this device for now. Checkout and payments stay
            preview until that module is connected.
          </p>
        </aside>
      </div>

      <PreviewNotice
        open={preview !== null}
        action={preview ?? ""}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
