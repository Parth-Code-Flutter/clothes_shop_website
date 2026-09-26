"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, PackageCheck, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useCart } from "@/features/cart/cart-provider";
import { formatInrFromPaise } from "@/lib/money";

const FREE_SHIPPING_PAISE = 299900;

export function CartView() {
  const { lines, itemCount, subtotalPaise, setQuantity, removeLine, clearCart } = useCart();
  const shippingGap = Math.max(0, FREE_SHIPPING_PAISE - subtotalPaise);
  const shippingProgress = Math.min(100, (subtotalPaise / FREE_SHIPPING_PAISE) * 100);

  if (lines.length === 0) {
    return (
      <div className="relative isolate min-h-[72vh] overflow-hidden bg-[#f1ebe2] px-5 py-20 text-center text-[#160604] dark:bg-footer dark:text-footer-foreground sm:py-28">
        <span className="pointer-events-none absolute -top-8 left-1/2 -z-10 -translate-x-1/2 font-display text-[30vw] leading-none text-black/[0.035] dark:text-white/[0.035]">00</span>
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <span className="flex size-16 items-center justify-center rounded-full border border-current/20"><ShoppingBag size={24} aria-hidden="true" /></span>
          <p className="mt-7 text-[10px] font-bold tracking-[0.3em] text-accent uppercase">Your wardrobe queue</p>
          <h1 className="mt-3 font-display text-6xl leading-[0.9] tracking-wide sm:text-8xl">The bag is<br />wide open.</h1>
          <p className="mt-6 max-w-md text-sm leading-7 opacity-65">Start with one piece that feels like you. Your selection will stay saved on this device while you keep browsing.</p>
          <Link href="/shop" className="mt-8 inline-flex min-h-13 items-center gap-4 bg-accent px-7 text-xs font-bold tracking-[0.14em] text-white uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">Enter the wardrobe <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <header className="border-b border-border bg-[#180805] px-5 py-10 text-white sm:px-8 lg:px-12 lg:py-14">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-[#ff5c53] uppercase">The fitting room · Step 01</p>
            <h1 className="mt-3 font-display text-6xl leading-none tracking-wide sm:text-8xl">Your bag.</h1>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.16em] uppercase sm:gap-5"><span>01 Bag</span><span className="h-px w-8 bg-white/25 sm:w-16" /><span className="text-white/40">02 Details</span><span className="h-px w-8 bg-white/25 sm:w-16" /><span className="text-white/40">03 Pay</span></div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-12 lg:py-14">
        <section aria-labelledby="bag-items-title">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
            <h2 id="bag-items-title" className="text-xs font-bold tracking-[0.18em] uppercase">Selected pieces · {itemCount}</h2>
            <button type="button" onClick={clearCart} className="min-h-10 text-xs text-muted underline decoration-border underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Clear bag</button>
          </div>
          <ul>
            {lines.map((line, index) => (
              <li key={`${line.productId}-${line.size ?? "os"}`} className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 border-b border-border py-6 sm:grid-cols-[148px_minmax(0,1fr)] sm:gap-7">
                <Link href={`/product/${line.slug}`} className="group relative aspect-[3/4] overflow-hidden bg-[#eee8de] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                  <Image src={line.image} alt={line.alt} fill sizes="148px" className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none" />
                  <span className="absolute top-2 left-2 bg-white/90 px-2 py-1 font-mono text-[9px] text-black">{String(index + 1).padStart(2, "0")}</span>
                </Link>
                <div className="flex min-w-0 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><p className="text-[9px] font-bold tracking-[0.2em] text-accent uppercase">House of Bollywood</p><Link href={`/product/${line.slug}`} className="mt-1 block font-display text-2xl leading-none tracking-wide hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-4xl">{line.name}</Link></div>
                    <p className="shrink-0 text-sm font-bold tabular-nums sm:text-base">{formatInrFromPaise(line.pricePaise * line.quantity)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted"><span>Size <strong className="text-foreground">{line.size ?? "One size"}</strong></span><span>{formatInrFromPaise(line.pricePaise)} each</span></div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                    <div className="inline-flex h-11 items-center border border-border bg-background">
                      <button type="button" aria-label={`Decrease ${line.name}`} className="flex size-10 items-center justify-center hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent" onClick={() => setQuantity(line.productId, line.quantity - 1, line.size)}><Minus size={13} aria-hidden="true" /></button>
                      <span className="min-w-8 text-center text-sm font-bold tabular-nums">{line.quantity}</span>
                      <button type="button" aria-label={`Increase ${line.name}`} className="flex size-10 items-center justify-center hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent" onClick={() => setQuantity(line.productId, line.quantity + 1, line.size)}><Plus size={13} aria-hidden="true" /></button>
                    </div>
                    <button type="button" aria-label={`Remove ${line.name}`} onClick={() => removeLine(line.productId, line.size)} className="inline-flex min-h-10 items-center gap-2 text-xs text-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><Trash2 size={14} aria-hidden="true" /> Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/shop" className="mt-6 inline-flex min-h-11 items-center gap-2 text-xs font-bold tracking-[0.12em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">← Continue exploring</Link>
        </section>

        <aside className="h-fit border border-border bg-[#f5f0e9] p-5 text-[#160604] dark:bg-surface dark:text-foreground sm:p-7 lg:sticky lg:top-24">
          <p className="text-[10px] font-bold tracking-[0.24em] text-accent uppercase">Order summary</p>
          <h2 className="mt-2 font-display text-4xl tracking-wide">Ready when you are.</h2>
          <div className="mt-6 border-y border-black/10 py-5 dark:border-white/10">
            <div className="flex justify-between text-sm"><span className="opacity-60">Subtotal</span><strong>{formatInrFromPaise(subtotalPaise)}</strong></div>
            <div className="mt-3 flex justify-between text-sm"><span className="opacity-60">Shipping</span><span>{shippingGap === 0 ? "Free" : "Calculated next"}</span></div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10"><div className="h-full bg-accent transition-[width]" style={{ width: `${shippingProgress}%` }} /></div>
            <p className="mt-2 text-[11px] leading-5 opacity-60">{shippingGap === 0 ? "Free shipping unlocked." : `Add ${formatInrFromPaise(shippingGap)} more to unlock free shipping.`}</p>
          </div>
          <div className="flex items-end justify-between gap-4 py-6"><span className="text-sm font-bold uppercase">Total</span><strong className="font-display text-4xl tracking-wide">{formatInrFromPaise(subtotalPaise)}</strong></div>
          <Link href="/checkout" className="flex min-h-14 w-full items-center justify-between bg-accent px-5 text-xs font-bold tracking-[0.14em] text-white uppercase transition-colors hover:bg-[#c41010] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"><span>Secure checkout</span><ArrowRight size={17} aria-hidden="true" /></Link>
          <ul className="mt-6 grid gap-3 text-[11px] leading-5 opacity-70"><li className="flex items-center gap-3"><ShieldCheck size={16} aria-hidden="true" /> Secure payment at checkout</li><li className="flex items-center gap-3"><Truck size={16} aria-hidden="true" /> Delivery estimate before payment</li><li className="flex items-center gap-3"><PackageCheck size={16} aria-hidden="true" /> Easy returns policy shown at checkout</li></ul>
        </aside>
      </div>
    </div>
  );
}
