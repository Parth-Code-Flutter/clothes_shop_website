"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, X } from "lucide-react";
import { useMemo } from "react";
import { ProductCard } from "@/components/shared/product-card";
import { productGridClass } from "@/components/shared/product-grid";
import { getAllProducts, getCategoryById, getProductBySlug } from "@/features/catalog/data";
import shopStyles from "@/features/shop/components/shop-listing.module.css";
import { useWishlist } from "@/features/wishlist/wishlist-provider";
import { formatInrFromPaise } from "@/lib/money";
import { cn } from "@/lib/utils";
import styles from "./wishlist-view.module.css";

export function WishlistView() {
  const { items, count, removeProduct, clearWishlist } = useWishlist();
  const popular = useMemo(() => [...getAllProducts()].sort((a, b) => b.popularity - a.popularity).slice(0, 5), []);

  const saved = items.map((item) => ({ item, product: getProductBySlug(item.slug) }));
  const totalPaise = saved.reduce((sum, { item, product }) => sum + (product?.pricePaise ?? item.pricePaise), 0);
  const savingsPaise = saved.reduce((sum, { product }) => (product?.mrpPaise && product.mrpPaise > product.pricePaise ? sum + product.mrpPaise - product.pricePaise : sum), 0);

  const heading = (
    <div>
      <p className={styles.eyebrow}>Reserved for you</p>
      <h1 className="mt-2 font-display text-5xl leading-none tracking-wide uppercase sm:text-6xl">Your wishlist</h1>
      <p className="mt-2 text-xs text-muted">Saved on this device. Pick a size whenever you&apos;re ready.</p>
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1380px] px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <div className="border-b border-border pb-5">{heading}</div>

        <div className={cn(styles.emptyWrap, "mt-10 max-w-3xl")}>
          <div className={styles.empty}>
            <p className={styles.emptyStub}>
              <Heart className="size-9" strokeWidth={1.5} aria-hidden="true" />
              <small>No seats held</small>
            </p>
            <div className={styles.emptyBody}>
              <p className="font-display text-3xl leading-none tracking-wide uppercase sm:text-4xl">Nothing saved yet</p>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted">Tap the heart on any piece to hold it here. Your list stays together on this device.</p>
              <div className="mt-6">
                <Link href="/shop" className={cn(styles.cta, "min-h-12 px-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
                  Browse tonight&apos;s programme <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16" aria-labelledby="wishlist-popular">
          <h2 id="wishlist-popular" className="flex items-center gap-2 text-[11px] font-bold tracking-[.16em] uppercase before:size-1.5 before:rotate-45 before:bg-accent">Popular tonight</h2>
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
        {heading}
        <div className="flex items-end gap-6">
          <p className="sm:text-right">
            <span className={cn(styles.seatCount, "block")}>{String(count).padStart(2, "0")}</span>
            <span className={styles.seatLabel}>{count === 1 ? "Piece saved" : "Pieces saved"}</span>
          </p>
          <button type="button" onClick={clearWishlist} className="min-h-10 text-xs text-muted underline decoration-border underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Clear all</button>
        </div>
      </div>

      <ul className={cn(shopStyles.cast, "mt-8 grid gap-6 lg:grid-cols-2")}>
        {saved.map(({ item, product }, index) => {
          const seat = String(index + 1).padStart(2, "0");
          const href = `/product/${item.slug}`;
          const category = product ? getCategoryById(product.categoryId) : undefined;
          const pricePaise = product?.pricePaise ?? item.pricePaise;
          const hasOffer = Boolean(product?.mrpPaise && product.mrpPaise > pricePaise);
          const off = hasOffer ? Math.round(((product!.mrpPaise! - pricePaise) / product!.mrpPaise!) * 100) : 0;
          return (
            <li key={item.productId} className={styles.booking}>
              <div className={styles.paper}>
                <Link href={href} aria-label={`View ${item.name}`} className={cn(styles.poster, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
                  <Image src={item.image} alt={item.alt} fill sizes="(max-width: 640px) 112px, 148px" className="object-cover" />
                </Link>
                <div className={styles.details}>
                  <p className={styles.admit}><span>Admit one</span><span>Seat {seat}</span></p>
                  <p className={styles.row}>{category?.name ?? "House"} · Row {(category?.name ?? "H").charAt(0)}</p>
                  <h2 className={cn(styles.name, "line-clamp-2")}>
                    <Link href={href} className="hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">{item.name}</Link>
                  </h2>
                  {product ? <p className={cn(styles.meta, "truncate")}>{product.color} · {product.fit}</p> : null}
                  {product?.sizes.length ? (
                    <p className={styles.sizes}>
                      <small>Sizes</small>
                      {product.sizes.map((size) => <span key={size}>{size}</span>)}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className={styles.stub}>
                <p className={styles.stubLabel}>Tonight&apos;s price</p>
                <p className={styles.price}>{formatInrFromPaise(pricePaise)}</p>
                <p className={styles.was}>
                  {hasOffer ? <><span className="sr-only">Original price </span><s>{formatInrFromPaise(product!.mrpPaise!)}</s> <b>{off}% off</b></> : null}
                </p>
                <Link href={href} className={cn(styles.cta, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
                  Choose size <ArrowRight size={14} aria-hidden="true" />
                </Link>
                <button type="button" onClick={() => removeProduct(item.productId)} aria-label={`Remove ${item.name} from wishlist`} className={cn(styles.release, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
                  <X size={12} aria-hidden="true" /> Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className={shopStyles.wrap}>
        <div>
          <p>That&apos;s a <span>wrap.</span></p>
          <small>
            {count} {count === 1 ? "piece" : "pieces"} saved · together {formatInrFromPaise(totalPaise)}
            {savingsPaise > 0 ? ` · you save ${formatInrFromPaise(savingsPaise)}` : ""}
          </small>
        </div>
        <Link href="/shop">Keep discovering <ArrowRight size={14} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
