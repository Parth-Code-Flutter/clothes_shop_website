"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  Ruler,
  Share2,
  ShoppingBag,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";
import { getCategoryById } from "@/features/catalog/data";
import { useWishlist } from "@/features/wishlist/wishlist-provider";
import { formatInrFromPaise } from "@/lib/money";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

export function ProductDetail({ product }: { product: CatalogProduct }) {
  const router = useRouter();
  const { addProduct } = useCart();
  const { hasProduct, toggleProduct } = useWishlist();
  const saved = hasProduct(product.id);
  const category = getCategoryById(product.categoryId);
  const gallery = product.gallery.length > 0 ? product.gallery : [product.image];
  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");
  const [deliveryNote, setDeliveryNote] = useState<string | null>(null);

  const activeImage = gallery[activeIndex] ?? product.image;
  const price = formatInrFromPaise(product.pricePaise);
  const hasOffer = Boolean(product.mrpPaise && product.mrpPaise > product.pricePaise);
  const discount = useMemo(() => {
    if (!hasOffer || !product.mrpPaise) return null;
    return Math.round(((product.mrpPaise - product.pricePaise) / product.mrpPaise) * 100);
  }, [hasOffer, product.mrpPaise, product.pricePaise]);

  function addToBag() {
    if (!size) {
      setSizeError(true);
      return false;
    }
    addProduct(product, quantity, size);
    setAdded(true);
    setSizeError(false);
    return true;
  }

  function buyNow() {
    if (addToBag()) router.push("/checkout");
  }

  async function shareProduct() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareNote("Product link copied");
    } catch {
      setShareNote("Copy the page address to share this piece");
    }
  }

  function checkDelivery() {
    if (!/^\d{6}$/.test(pincode.trim())) {
      setDeliveryNote("Enter a valid 6-digit PIN code.");
      return;
    }
    setDeliveryNote("Delivery estimates will appear here when fulfilment is connected. No address was saved.");
  }

  function moveImage(direction: -1 | 1) {
    setActiveIndex((current) => (current + direction + gallery.length) % gallery.length);
    setZoomScale(1);
  }

  function selectImage(index: number) {
    setActiveIndex(index);
    setZoomScale(1);
  }

  function changeZoom(amount: number) {
    setZoomScale((current) => Math.min(3, Math.max(1, Number((current + amount).toFixed(2)))));
  }

  useEffect(() => {
    if (!zoomOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomOpen(false);
      if (event.key === "ArrowLeft") { setActiveIndex((current) => (current - 1 + gallery.length) % gallery.length); setZoomScale(1); }
      if (event.key === "ArrowRight") { setActiveIndex((current) => (current + 1) % gallery.length); setZoomScale(1); }
      if (event.key === "+" || event.key === "=") changeZoom(0.25);
      if (event.key === "-") changeZoom(-0.25);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [zoomOpen, gallery.length]);

  return (
    <>
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-10 xl:px-14">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-muted uppercase">
            <Link href="/shop" className="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft size={12} aria-hidden="true" /> Shop</Link>
            <span aria-hidden="true">/</span>
            {category ? <Link href={`/shop?category=${category.id}`} className="truncate hover:text-foreground">{category.name}</Link> : null}
            <span aria-hidden="true">/</span>
            <span className="hidden truncate text-foreground sm:block">{product.name}</span>
          </nav>
          <p className="hidden text-[9px] font-bold tracking-[0.22em] text-muted uppercase md:block">Product scene · 01</p>
        </div>
      </div>

      <section className="bg-background text-foreground">
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[minmax(0,1.38fr)_minmax(390px,0.62fr)]">
          <div className="relative bg-[#eee8de] p-0 dark:bg-footer md:p-5 lg:p-7">
            <div
              className={cn(
                "grid gap-3 lg:gap-5",
                gallery.length > 1 && "md:grid-cols-[84px_minmax(0,1fr)]",
              )}
            >
              {gallery.length > 1 ? (
                <div className="order-2 flex gap-2 overflow-x-auto bg-background p-3 [scrollbar-width:none] md:order-1 md:max-h-[calc(100vh-132px)] md:flex-col md:overflow-y-auto md:bg-transparent md:p-0 [&::-webkit-scrollbar]:hidden" aria-label="Product image choices">
                  {gallery.map((src, index) => (
                    <button key={`${src}-${index}`} type="button" onClick={() => selectImage(index)} aria-label={`Show photo ${index + 1}`} aria-pressed={activeIndex === index} className={cn("group/thumb relative aspect-[3/4] w-16 shrink-0 overflow-hidden bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:w-full", activeIndex === index ? "ring-2 ring-accent ring-offset-2 ring-offset-[#eee8de] dark:ring-offset-footer" : "opacity-55 hover:opacity-100")}>
                      <Image src={src} alt="" fill sizes="84px" className="object-cover transition-transform duration-300 group-hover/thumb:scale-105" />
                      <span className="absolute bottom-1 left-1 bg-black/65 px-1.5 py-1 font-mono text-[8px] text-white">{String(index + 1).padStart(2, "0")}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              <figure className="group relative order-1 aspect-[3/4] overflow-hidden bg-[#e3dbcf] md:order-2 md:min-h-[calc(100vh-132px)] md:aspect-auto">
                <button type="button" onClick={() => { setZoomScale(1); setZoomOpen(true); }} aria-label={`Zoom ${product.name} image ${activeIndex + 1}`} className="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent">
                  <Image src={activeImage} alt={product.alt} fill priority sizes="(max-width: 1024px) 100vw, 68vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.02] motion-reduce:transition-none" />
                </button>
                <figcaption className="pointer-events-none absolute top-5 left-5 border border-black/15 bg-white/90 px-3 py-2 text-[9px] font-bold tracking-[0.2em] text-black uppercase backdrop-blur">Look {String(activeIndex + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</figcaption>
                <span className="pointer-events-none absolute top-5 right-5 flex size-11 items-center justify-center rounded-full border border-white/45 bg-black/35 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100" aria-hidden="true"><ZoomIn size={17} /></span>
                {gallery.length > 1 ? (
                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
                    <button type="button" onClick={() => moveImage(-1)} aria-label="Previous product image" className="flex size-12 items-center justify-center rounded-full border border-white/45 bg-black/40 text-white backdrop-blur hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2"><ArrowLeft size={18} aria-hidden="true" /></button>
                    <button type="button" onClick={() => moveImage(1)} aria-label="Next product image" className="flex size-12 items-center justify-center rounded-full border border-white/45 bg-black/40 text-white backdrop-blur hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2"><ArrowRight size={18} aria-hidden="true" /></button>
                  </div>
                ) : null}
              </figure>
            </div>
          </div>

          <aside className="border-l border-border bg-background lg:sticky lg:top-[76px] lg:h-[calc(100vh-76px)] lg:overflow-y-auto" data-lenis-prevent>
            <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[9px] font-bold tracking-[0.25em] text-accent uppercase">House of Bollywood</p>
                  <h1 className="mt-3 font-display text-5xl leading-[0.9] tracking-wide sm:text-6xl">{product.name}</h1>
                </div>
                <button type="button" onClick={() => toggleProduct(product)} aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name}`} aria-pressed={saved} className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                  <Heart className={cn("size-5", saved && "fill-accent text-accent")} aria-hidden="true" />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border pb-6">
                <span className="text-xl font-bold tabular-nums">{price}</span>
                {hasOffer ? <span className="text-sm text-muted line-through tabular-nums">{formatInrFromPaise(product.mrpPaise!)}</span> : null}
                {discount ? <span className="bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{discount}% OFF</span> : null}
              </div>

              <p className="mt-6 text-sm leading-7 text-muted">{product.summary}</p>

              <fieldset className="mt-8">
                <div className="flex items-center justify-between gap-4">
                  <legend className="text-xs font-bold tracking-[0.16em] uppercase">Select size {size ? <span className="text-accent">· {size}</span> : null}</legend>
                  <button type="button" onClick={() => setSizeGuideOpen(true)} className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold underline decoration-accent underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><Ruler size={15} aria-hidden="true" /> Size guide</button>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {product.sizes.map((option) => {
                    const selected = size === option;
                    return (
                      <button key={option} type="button" aria-pressed={selected} onClick={() => { setSize(option); setSizeError(false); setAdded(false); }} className={cn("relative flex h-12 items-center justify-center border text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent", selected ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground")}>
                        {option}{selected ? <Check size={12} className="absolute top-1 right-1" aria-hidden="true" /> : null}
                      </button>
                    );
                  })}
                </div>
                {sizeError ? <p className="mt-2 text-sm text-accent" role="alert">Choose a size before continuing.</p> : null}
              </fieldset>

              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="text-xs font-bold tracking-[0.16em] uppercase">Quantity</span>
                <div className="inline-flex items-center border border-border">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex size-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><Minus size={14} aria-hidden="true" /></button>
                  <span className="min-w-9 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)} className="flex size-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><Plus size={14} aria-hidden="true" /></button>
                </div>
              </div>

              <div className="mt-7 hidden grid-cols-2 gap-2 sm:grid">
                <Button className="rounded-none bg-foreground text-background hover:bg-accent hover:text-white" onClick={addToBag}><ShoppingBag className="mr-2 size-4" aria-hidden="true" />{added ? "Added" : "Add to bag"}</Button>
                <Button className="rounded-none" onClick={buyNow}>Buy now <ArrowRight className="ml-2 size-4" aria-hidden="true" /></Button>
              </div>
              {added ? <p className="mt-3 hidden text-sm text-muted sm:block" role="status">Added in size {size}. <Link href="/cart" className="font-bold text-foreground underline decoration-accent underline-offset-4">Open bag</Link></p> : null}

              <div className="mt-8 border-y border-border py-5">
                <label htmlFor="delivery-pincode" className="text-xs font-bold tracking-[0.14em] uppercase">Check delivery</label>
                <div className="mt-3 flex border border-border focus-within:border-foreground">
                  <input id="delivery-pincode" inputMode="numeric" maxLength={6} value={pincode} onChange={(event) => { setPincode(event.target.value.replace(/\D/g, "")); setDeliveryNote(null); }} placeholder="Enter PIN code" className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none" />
                  <button type="button" onClick={checkDelivery} className="px-4 text-xs font-bold uppercase text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Check</button>
                </div>
                {deliveryNote ? <p className="mt-2 text-xs leading-5 text-muted" role="status">{deliveryNote}</p> : null}
              </div>

              <div className="divide-y divide-border">
                <DetailDisclosure title="Product details"><p>{product.summary}</p><p className="mt-2">Category: {category?.name ?? "Clothing"}. Available sizes: {product.sizes.join(", ")}.</p></DetailDisclosure>
                <DetailDisclosure title="Fabric & care"><p>Fabric composition and care instructions are being confirmed for this item and will be shown before launch.</p></DetailDisclosure>
                <DetailDisclosure title="Delivery & returns"><p>This is a storefront preview. Delivery estimates, shipping charges, and the final returns policy will be connected to the live fulfilment system.</p></DetailDisclosure>
              </div>

              <button type="button" onClick={shareProduct} className="mt-5 inline-flex min-h-11 items-center gap-2 text-xs font-bold tracking-[0.12em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><Share2 size={15} aria-hidden="true" /> Share this piece</button>
              {shareNote ? <p className="mt-1 text-xs text-muted" role="status">{shareNote}</p> : null}
            </div>
          </aside>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{product.name}</p><p className="text-sm tabular-nums">{price}{size ? ` · ${size}` : ""}</p></div>
          <Button className="shrink-0 rounded-none bg-foreground px-5 text-background" onClick={addToBag}>{added ? "Added" : "Add to bag"}</Button>
        </div>
        {sizeError ? <p className="mt-2 text-xs text-accent" role="alert">Select a size first.</p> : null}
      </div>
      <div className="h-24 sm:hidden" aria-hidden="true" />

      {sizeGuideOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby="size-guide-title" className="fixed inset-0 z-[70] flex items-end justify-center bg-overlay p-0 sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setSizeGuideOpen(false); }}>
          <div className="w-full max-w-lg bg-background p-6 text-foreground shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5"><div><p className="text-[9px] font-bold tracking-[0.22em] text-accent uppercase">Fit room</p><h2 id="size-guide-title" className="mt-2 font-display text-4xl tracking-wide">Choose your size</h2></div><button type="button" onClick={() => setSizeGuideOpen(false)} aria-label="Close size guide" className="flex size-11 items-center justify-center rounded-full border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><X size={18} aria-hidden="true" /></button></div>
            <p className="mt-5 text-sm leading-7 text-muted">Available labels for this product are shown below. Exact garment measurements are still being confirmed, so no unverified fit measurements are displayed.</p>
            <div className="mt-6 grid grid-cols-4 gap-2">{product.sizes.map((option) => <button key={option} type="button" onClick={() => { setSize(option); setSizeError(false); setSizeGuideOpen(false); }} className={cn("h-12 border text-sm font-bold", size === option ? "border-foreground bg-foreground text-background" : "border-border")}>{option}</button>)}</div>
          </div>
        </div>
      ) : null}

      {zoomOpen ? (
        <div role="dialog" aria-modal="true" aria-label={`${product.name} image gallery`} className="fixed inset-0 z-[80] flex bg-[#0b0908]/98 text-white" onMouseDown={(event) => { if (event.target === event.currentTarget) setZoomOpen(false); }}>
          <div className="relative flex min-h-0 w-full flex-col">
            <div className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-white/15 px-4 py-2 sm:px-6">
              <div><p className="text-[9px] font-bold tracking-[0.22em] text-white/45 uppercase">Look {String(activeIndex + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</p><p className="mt-1 text-sm font-semibold">{product.name}</p></div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center rounded-full border border-white/20 bg-black/30 p-1">
                  <button type="button" onClick={() => changeZoom(-0.25)} disabled={zoomScale <= 1} aria-label="Zoom out" className="flex size-9 items-center justify-center rounded-full hover:bg-white hover:text-black focus-visible:outline-2 disabled:opacity-30"><ZoomOut size={16} aria-hidden="true" /></button>
                  <span className="min-w-12 text-center font-mono text-[10px] tabular-nums">{Math.round(zoomScale * 100)}%</span>
                  <button type="button" onClick={() => changeZoom(0.25)} disabled={zoomScale >= 3} aria-label="Zoom in" className="flex size-9 items-center justify-center rounded-full hover:bg-white hover:text-black focus-visible:outline-2 disabled:opacity-30"><ZoomIn size={16} aria-hidden="true" /></button>
                  <button type="button" onClick={() => setZoomScale(1)} disabled={zoomScale === 1} aria-label="Reset zoom" className="hidden size-9 items-center justify-center rounded-full hover:bg-white hover:text-black focus-visible:outline-2 disabled:opacity-30 sm:flex"><RotateCcw size={15} aria-hidden="true" /></button>
                </div>
                <button autoFocus type="button" onClick={() => setZoomOpen(false)} aria-label="Close image gallery" className="flex size-11 items-center justify-center rounded-full border border-white/25 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><X size={19} aria-hidden="true" /></button>
              </div>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <button type="button" onClick={() => setZoomScale((current) => current === 1 ? 2 : 1)} aria-label={zoomScale === 1 ? "Zoom image to 200 percent" : "Reset image zoom"} className={cn("absolute inset-0 block h-full w-full focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white", zoomScale > 1 ? "cursor-zoom-out" : "cursor-zoom-in")}>
                <span className="relative block h-full w-full transition-transform duration-200" style={{ transform: `scale(${zoomScale})` }}>
                  <Image src={activeImage} alt={`${product.alt}, enlarged view ${activeIndex + 1}`} fill sizes="100vw" className="object-contain p-3 sm:p-8" priority />
                </span>
              </button>
              {gallery.length > 1 ? (
                <>
                  <button type="button" onClick={() => moveImage(-1)} aria-label="Previous enlarged image" className="absolute top-1/2 left-3 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 backdrop-blur hover:bg-white hover:text-black focus-visible:outline-2 sm:left-6"><ArrowLeft size={19} aria-hidden="true" /></button>
                  <button type="button" onClick={() => moveImage(1)} aria-label="Next enlarged image" className="absolute top-1/2 right-3 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 backdrop-blur hover:bg-white hover:text-black focus-visible:outline-2 sm:right-6"><ArrowRight size={19} aria-hidden="true" /></button>
                </>
              ) : null}
            </div>
            <div className="flex h-24 shrink-0 items-center justify-center gap-2 overflow-x-auto border-t border-white/15 px-4">
              {gallery.map((src, index) => (
                <button key={`${src}-zoom-${index}`} type="button" onClick={() => selectImage(index)} aria-label={`Show enlarged image ${index + 1}`} aria-pressed={activeIndex === index} className={cn("relative aspect-[3/4] h-16 shrink-0 overflow-hidden focus-visible:outline-2 focus-visible:outline-white", activeIndex === index ? "ring-2 ring-white" : "opacity-45 hover:opacity-100")}><Image src={src} alt="" fill sizes="64px" className="object-cover" /></button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DetailDisclosure({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-xs font-bold tracking-[0.14em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">{title}<ChevronDown size={16} className="transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
      <div className="pb-5 text-xs leading-6 text-muted">{children}</div>
    </details>
  );
}
