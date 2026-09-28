"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Heart, Minus, PackageCheck, Plus, ShieldCheck, ShoppingBag, Truck, X } from "lucide-react";
import { useMemo } from "react";
import { ProductCard } from "@/components/shared/product-card";
import { productGridClass } from "@/components/shared/product-grid";
import { useCart } from "@/features/cart/cart-provider";
import { FREE_SHIPPING_PAISE } from "@/features/cart/utils";
import { getAllProducts, getCategoryById, getProductBySlug } from "@/features/catalog/data";
import shopStyles from "@/features/shop/components/shop-listing.module.css";
import { useWishlist } from "@/features/wishlist/wishlist-provider";
import { formatInrFromPaise } from "@/lib/money";
import { cn } from "@/lib/utils";
import styles from "./cart-view.module.css";

const admitWords = ["one", "two", "three", "four", "five"];

function CheckoutSteps() {
  return (
    <ol className={styles.steps} aria-label="Checkout steps">
      <li><span className={styles.step} aria-current="step"><b>01</b> Bag</span></li>
      <li className={styles.stepLine} aria-hidden="true" />
      <li><span className={styles.step}><b>02</b> Details</span></li>
      <li className={styles.stepLine} aria-hidden="true" />
      <li><span className={styles.step}><b>03</b> Pay</span></li>
    </ol>
  );
}

export function CartView() {
  const { lines, itemCount, subtotalPaise, setQuantity, removeLine, clearCart } = useCart();
  const { count: savedCount } = useWishlist();
  const popular = useMemo(() => [...getAllProducts()].sort((a, b) => b.popularity - a.popularity).slice(0, 5), []);

  const shippingGap = Math.max(0, FREE_SHIPPING_PAISE - subtotalPaise);
  const shippingProgress = Math.min(100, (subtotalPaise / FREE_SHIPPING_PAISE) * 100);
  const savingsPaise = lines.reduce((sum, line) => {
    const mrp = getProductBySlug(line.slug)?.mrpPaise;
    return mrp && mrp > line.pricePaise ? sum + (mrp - line.pricePaise) * line.quantity : sum;
  }, 0);

  if (lines.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1380px] px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-5">
          <div>
            <p className={styles.eyebrow}>Your booking</p>
            <h1 className="mt-2 font-display text-5xl leading-none tracking-wide uppercase sm:text-6xl">Your bag</h1>
          </div>
          <CheckoutSteps />
        </div>

        <div className={cn(styles.emptyWrap, "mt-10 max-w-3xl")}>
          <div className={styles.empty}>
            <p className={styles.emptyStub}>
              <ShoppingBag className="size-9" strokeWidth={1.5} aria-hidden="true" />
              <small>No seats booked</small>
            </p>
            <div className={styles.emptyBody}>
              <p className="font-display text-3xl leading-none tracking-wide uppercase sm:text-4xl">Your bag is empty</p>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted">Pick a piece and a size, and it will wait here on this device while you keep browsing.</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link href="/shop" className={cn(styles.emptyCta, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
                  Browse tonight&apos;s programme <ArrowRight size={15} aria-hidden="true" />
                </Link>
                {savedCount > 0 ? (
                  <Link href="/wishlist" className="inline-flex min-h-10 items-center gap-2 text-xs font-bold tracking-[.12em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                    <Heart size={14} aria-hidden="true" /> {savedCount} saved in your wishlist
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16" aria-labelledby="bag-popular">
          <h2 id="bag-popular" className="flex items-center gap-2 text-[11px] font-bold tracking-[.16em] uppercase before:size-1.5 before:rotate-45 before:bg-accent">Popular tonight</h2>
          <div className={cn(productGridClass, shopStyles.cast, "mt-6 gap-y-14 sm:gap-y-16")}>
            {popular.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} variant="cinema" />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 pt-8 pb-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-5">
        <div>
          <p className={styles.eyebrow}>Your booking</p>
          <h1 className="mt-2 font-display text-5xl leading-none tracking-wide uppercase sm:text-6xl">Your bag</h1>
          <p className="mt-2 text-xs text-muted"><span className="font-semibold text-foreground">{itemCount}</span> {itemCount === 1 ? "piece" : "pieces"} · saved on this device</p>
        </div>
        <CheckoutSteps />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section aria-labelledby="bag-items-title">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 id="bag-items-title" className="flex items-center gap-2 text-[11px] font-bold tracking-[.16em] uppercase before:size-1.5 before:rotate-45 before:bg-accent">Your tickets</h2>
            <button type="button" onClick={clearCart} className="min-h-10 text-xs text-muted underline decoration-border underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Clear bag</button>
          </div>
          <ul className="grid gap-5">
            {lines.map((line, index) => {
              const product = getProductBySlug(line.slug);
              const category = product ? getCategoryById(product.categoryId) : undefined;
              const href = `/product/${line.slug}`;
              const mrp = product?.mrpPaise && product.mrpPaise > line.pricePaise ? product.mrpPaise : null;
              const off = mrp ? Math.round(((mrp - line.pricePaise) / mrp) * 100) : 0;
              return (
                <li key={`${line.productId}-${line.size ?? "os"}`} className={styles.line}>
                  <div className={styles.paper}>
                    <Link href={href} aria-label={`View ${line.name}`} className={cn(styles.poster, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
                      <Image src={line.image} alt={line.alt} fill sizes="(max-width: 640px) 104px, 132px" className="object-cover" />
                    </Link>
                    <div className={styles.details}>
                      <p className={styles.admit}><span>Admit {admitWords[line.quantity - 1] ?? line.quantity}</span><span>Seat {String(index + 1).padStart(2, "0")}</span></p>
                      <p className={styles.row}>{category?.name ?? "House"} · Row {(category?.name ?? "H").charAt(0)}</p>
                      <h3 className={cn(styles.name, "line-clamp-2")}>
                        <Link href={href} className="hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">{line.name}</Link>
                      </h3>
                      {product ? <p className={cn(styles.meta, "truncate")}>{product.color} · {product.fit}</p> : null}
                      <p className={styles.seatRow}><small>Size</small><span className={styles.seat}>{line.size ?? "One size"}</span></p>
                    </div>
                  </div>
                  <div className={styles.stub}>
                    <p className={styles.stubLabel}>Line total</p>
                    <p className={styles.price}>{formatInrFromPaise(line.pricePaise * line.quantity)}</p>
                    <p className={styles.each}>
                      {formatInrFromPaise(line.pricePaise)} each
                      {mrp ? <><span className="sr-only">, original price</span><s>{formatInrFromPaise(mrp)}</s><b>{off}% off</b></> : null}
                    </p>
                    <div className={styles.controls}>
                      <div className={styles.stepper}>
                        <button type="button" aria-label={`Decrease ${line.name}`} onClick={() => setQuantity(line.productId, line.quantity - 1, line.size)} className="focus-visible:outline-2 focus-visible:outline-accent"><Minus size={13} aria-hidden="true" /></button>
                        <span><span className="sr-only">Quantity </span>{line.quantity}</span>
                        <button type="button" aria-label={`Increase ${line.name}`} onClick={() => setQuantity(line.productId, line.quantity + 1, line.size)} className="focus-visible:outline-2 focus-visible:outline-accent"><Plus size={13} aria-hidden="true" /></button>
                      </div>
                      <button type="button" aria-label={`Remove ${line.name}`} onClick={() => removeLine(line.productId, line.size)} className={cn(styles.release, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
                        <X size={12} aria-hidden="true" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <Link href="/shop" className="mt-6 inline-flex min-h-11 items-center gap-2 text-xs font-bold tracking-[0.12em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><ArrowLeft size={14} aria-hidden="true" /> Continue exploring</Link>
        </section>

        <aside className={cn(styles.receipt, "h-fit lg:sticky lg:top-24")} aria-labelledby="bag-summary-title">
          <div className={styles.receiptTop}>
            <p className={styles.eyebrow}>Box office</p>
            <h2 id="bag-summary-title" className="mt-2 font-display text-4xl leading-none tracking-wide uppercase">Order summary</h2>
            <dl className="mt-6">
              {savingsPaise > 0 ? (
                <>
                  <div className={styles.receiptRow}><dt>Total MRP</dt><dd>{formatInrFromPaise(subtotalPaise + savingsPaise)}</dd></div>
                  <div className={cn(styles.receiptRow, styles.saving)}><dt>Discount on MRP</dt><dd>−{formatInrFromPaise(savingsPaise)}</dd></div>
                </>
              ) : null}
              <div className={styles.receiptRow}><dt>Subtotal · {itemCount} {itemCount === 1 ? "piece" : "pieces"}</dt><dd>{formatInrFromPaise(subtotalPaise)}</dd></div>
              <div className={styles.receiptRow}><dt>Delivery</dt><dd>{shippingGap === 0 ? "Free" : "Calculated next"}</dd></div>
            </dl>
            <div className={styles.reel} role="progressbar" aria-label="Progress to free delivery" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(shippingProgress)}>
              <div className={styles.reelFill} style={{ width: `${shippingProgress}%` }} />
            </div>
            <p className={styles.reelNote}>
              {shippingGap === 0 ? <><strong>Free delivery unlocked.</strong> Enjoy the show.</> : <>Add <strong>{formatInrFromPaise(shippingGap)}</strong> more to unlock free delivery.</>}
            </p>
          </div>
          <div className={styles.receiptBottom}>
            <p className={styles.total}><span>Total</span><strong>{formatInrFromPaise(subtotalPaise)}</strong></p>
            {savingsPaise > 0 ? <p className="mt-2 text-right text-[11px] font-semibold text-accent">You save {formatInrFromPaise(savingsPaise)} on this booking</p> : null}
            <Link href="/checkout" className={cn(styles.cta, "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent")}>
              Secure checkout <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <ul className={styles.assure}>
              <li><ShieldCheck size={15} aria-hidden="true" /> Secure payment at checkout</li>
              <li><Truck size={15} aria-hidden="true" /> Delivery estimate before payment</li>
              <li><PackageCheck size={15} aria-hidden="true" /> Easy returns policy shown at checkout</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
