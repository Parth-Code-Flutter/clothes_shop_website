"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Sparkles, Trash2 } from "lucide-react";
import { getProductBySlug } from "@/features/catalog/data";
import { useWishlist } from "@/features/wishlist/wishlist-provider";
import { formatInrFromPaise } from "@/lib/money";

export function WishlistView() {
  const { items, count, removeProduct, clearWishlist } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="relative isolate min-h-[72vh] overflow-hidden bg-[#f3eee7] px-5 py-20 text-center text-[#160604] dark:bg-footer dark:text-footer-foreground sm:py-28">
        <Heart className="pointer-events-none absolute -right-16 -bottom-24 -z-10 size-[420px] stroke-[0.35] opacity-[0.07]" aria-hidden="true" />
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <span className="flex size-16 items-center justify-center rounded-full border border-current/20"><Heart size={24} aria-hidden="true" /></span>
          <p className="mt-7 text-[10px] font-bold tracking-[0.3em] text-accent uppercase">Your private edit</p>
          <h1 className="mt-3 font-display text-6xl leading-[0.9] tracking-wide sm:text-8xl">Save now.<br />Decide later.</h1>
          <p className="mt-6 max-w-md text-sm leading-7 opacity-65">Heart the pieces that catch your eye. We’ll keep your shortlist together on this device.</p>
          <Link href="/shop" className="mt-8 inline-flex min-h-13 items-center gap-4 bg-accent px-7 text-xs font-bold tracking-[0.14em] text-white uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">Find your next look <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <header className="overflow-hidden border-b border-border bg-[#f1ebe2] text-[#160604] dark:bg-footer dark:text-footer-foreground">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12 lg:py-16">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-accent uppercase"><Sparkles size={13} aria-hidden="true" /> Curated by you</p>
            <h1 className="mt-3 font-display text-7xl leading-[0.84] tracking-wide sm:text-9xl">The saved<br />edit.</h1>
          </div>
          <div className="max-w-xs lg:text-right"><p className="text-sm leading-7 opacity-65">Your personal rail of maybes, must-haves, and outfits waiting to happen.</p><p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase">{String(count).padStart(2, "0")} {count === 1 ? "piece" : "pieces"} on your rail</p></div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5"><p className="text-xs font-bold tracking-[0.18em] uppercase">Your shortlist</p><button type="button" onClick={clearWishlist} className="min-h-10 text-xs text-muted underline decoration-border underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Clear all saves</button></div>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => {
            const product = getProductBySlug(item.slug);
            return (
              <li key={item.productId} className="group flex min-w-0 flex-col">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#eee8de]">
                  <Link href={`/product/${item.slug}`} aria-label={`View ${item.name}`} className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent"><Image src={item.image} alt={item.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none" /></Link>
                  <span className="pointer-events-none absolute top-3 left-3 bg-white/90 px-2 py-1 font-mono text-[9px] text-black">SAVE {String(index + 1).padStart(2, "0")}</span>
                  <button type="button" onClick={() => removeProduct(item.productId)} aria-label={`Remove ${item.name} from saved pieces`} className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-white/90 text-black opacity-100 transition-opacity hover:bg-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"><Trash2 size={15} aria-hidden="true" /></button>
                  <Link href={`/product/${item.slug}`} className="absolute inset-x-3 bottom-3 flex min-h-12 translate-y-2 items-center justify-between bg-[#160604] px-4 text-[10px] font-bold tracking-[0.13em] text-white uppercase opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Choose size <ArrowRight size={15} aria-hidden="true" /></Link>
                </div>
                <div className="flex items-start justify-between gap-3 pt-3">
                  <div className="min-w-0"><p className="text-[9px] font-bold tracking-[0.18em] text-accent uppercase">House of Bollywood</p><h2 className="mt-1 truncate text-sm font-bold"><Link href={`/product/${item.slug}`} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">{item.name}</Link></h2>{product ? <p className="mt-1 text-[11px] text-muted">{product.sizes.length} sizes available</p> : null}</div>
                  <p className="shrink-0 text-sm font-bold tabular-nums">{formatInrFromPaise(item.pricePaise)}</p>
                </div>
                <Link href={`/product/${item.slug}`} className="mt-3 flex min-h-11 items-center justify-center border border-border text-[10px] font-bold tracking-[0.13em] uppercase hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden">Choose size</Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-14 flex flex-col items-start justify-between gap-5 border-t border-border pt-7 sm:flex-row sm:items-center"><p className="flex max-w-lg items-start gap-3 text-xs leading-6 text-muted"><Heart className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" /> Your edit lives on this device. Account sync will keep it with you everywhere in a later release.</p><Link href="/shop" className="inline-flex min-h-11 items-center gap-3 text-xs font-bold tracking-[0.12em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Keep discovering <ArrowRight size={15} aria-hidden="true" /></Link></div>
      </div>
    </div>
  );
}
