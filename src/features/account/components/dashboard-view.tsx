"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Armchair, Check, Heart, LogOut, ShieldCheck, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { ProductCard } from "@/components/shared/product-card";
import { productGridClass } from "@/components/shared/product-grid";
import { useAccount } from "@/features/account/account-provider";
import { useCart } from "@/features/cart/cart-provider";
import { catalogProducts } from "@/features/catalog/data";
import { useWishlist } from "@/features/wishlist/wishlist-provider";
import { formatInrFromPaise } from "@/lib/money";
import { cn } from "@/lib/utils";
import house from "./account-view.module.css";
import styles from "./dashboard-view.module.css";

type Frame = { id: string; image: string; alt: string };

export function DashboardView() {
  const router = useRouter();
  const { account, signedIn, signOut } = useAccount();
  const { lines, itemCount, subtotalPaise } = useCart();
  const { items: savedItems, count: wishlistCount } = useWishlist();

  useEffect(() => {
    if (!signedIn) router.replace("/account");
  }, [router, signedIn]);

  if (!signedIn || !account) {
    return <div className="min-h-[60vh] bg-background" aria-label="Returning to sign in" />;
  }

  const firstName = account.name.split(" ")[0];
  const isAdmin = account.role === "admin";
  const bagFrames = [...new Map(lines.map((line) => [line.productId, { id: line.productId, image: line.image, alt: line.alt }])).values()];
  const savedFrames = savedItems.map((item) => ({ id: item.productId, image: item.image, alt: item.alt }));

  const steps = [
    { label: "Create your member pass", done: true },
    { label: "Save a piece you love", done: wishlistCount > 0, href: "/shop", action: "Browse" },
    { label: "Add a piece to your bag", done: itemCount > 0, href: "/shop", action: "Shop" },
    { label: "Complete your first checkout", done: false, href: itemCount > 0 ? "/checkout" : "/shop", action: itemCount > 0 ? "Check out" : "Shop" },
  ];
  const doneCount = steps.filter((step) => step.done).length;

  const taken = new Set([...lines.map((line) => line.productId), ...savedItems.map((item) => item.productId)]);
  const fresh = catalogProducts.filter((product) => !taken.has(product.id));
  const showing = [...fresh.filter((product) => product.isNew), ...fresh.filter((product) => !product.isNew)].slice(0, 4);

  return (
    <div className="text-foreground">
      <header className={cn(house.stage, "pt-14 pb-12 lg:pt-16 lg:pb-16")}>
        <span className={house.bulbs} aria-hidden="true" />
        <div className="mx-auto grid max-w-[1360px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_480px] lg:px-12">
          <div>
            <p className={house.onAir}>Now showing · your wardrobe</p>
            <h1 className={cn(house.headline, "mt-4 text-6xl sm:text-7xl lg:text-8xl")}>
              Hey, <em>{firstName}.</em>
            </h1>
            <p className={cn(styles.heroNote, "mt-5")}>Your bag, your saved edit and your next steps, together in one private space.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/shop" className={cn(styles.primary, "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7bd62]")}>
                Browse the wardrobe <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <button type="button" onClick={() => { signOut(); router.replace("/account"); }} className={cn(styles.ghost, "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7bd62]")}>
                <LogOut size={14} aria-hidden="true" /> Sign out
              </button>
            </div>
          </div>

          <div aria-hidden="true">
            <div className={house.passWrap}>
              <div className={house.passPaper}>
                <p className={house.passTop}><span>House of Bollywood</span><span>{isAdmin ? "Admin pass" : "Member pass"}</span></p>
                <p className={house.passAdmit}>Admit one</p>
                <p className={house.passLabel}>Presented to</p>
                <p className={house.passName}>{account.name}</p>
                <p className={house.passMeta}><span className="max-w-full truncate">{account.email}</span><span>Valid every show</span></p>
              </div>
              <div className={house.passStub}>
                <span className={house.stubText}>{isAdmin ? "Admin" : "Member"}</span>
                <span className={house.stubNo}>No. 001</span>
                <span className={house.barcode} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1360px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <section aria-labelledby="programme-title">
            <p className={house.eyebrow}>Tonight&apos;s programme</p>
            <h2 id="programme-title" className="mt-3 font-display text-5xl leading-none tracking-wide uppercase sm:text-6xl">Your scene, organised.</h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <ReelTile
                href="/cart"
                icon={ShoppingBag}
                label="Shopping bag"
                value={`${itemCount} ${itemCount === 1 ? "piece" : "pieces"}`}
                note={itemCount > 0 ? `${formatInrFromPaise(subtotalPaise)} waiting in your bag` : "Your bag is ready for its first piece"}
                frames={bagFrames}
              />
              <ReelTile
                href="/wishlist"
                icon={Heart}
                label="Saved edit"
                value={`${wishlistCount} saved`}
                note={wishlistCount > 0 ? "Pieces you marked to come back to" : "Tap the heart on any piece to keep it here"}
                frames={savedFrames}
              />
            </div>

            <div className={cn(styles.orders, "mt-6")}>
              <div className={styles.ordersMain}>
                <p className={house.eyebrow}>Your orders</p>
                <p className={cn(styles.ordersTitle, "mt-3")}>No seats booked yet.</p>
                <p className="mt-2 max-w-lg text-sm leading-6 text-muted">Order status, delivery progress, invoices and returns appear here once live checkout connects.</p>
                <Link href={itemCount > 0 ? "/cart" : "/shop"} className={cn(styles.ordersLink, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
                  {itemCount > 0 ? "Review your bag" : "Find your first piece"} <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
              <div className={styles.ordersStub} aria-hidden="true">
                <Armchair size={18} className="text-[#e7bd62]" />
                <span className={styles.stubCount}>0</span>
                <span className={styles.stubLabel}>Orders</span>
              </div>
            </div>
          </section>

          <aside className="grid h-fit gap-4" aria-label="Your membership">
            <section className={cn(styles.card, styles.sprockets)} aria-labelledby="steps-title">
              <p className={house.eyebrow}>Coming up</p>
              <h2 id="steps-title" className={styles.cardTitle}>Your next steps</h2>
              <div className={styles.reel} aria-hidden="true">
                {steps.map((step) => <span key={step.label} data-done={step.done} />)}
              </div>
              <p className={styles.reelLabel}>{doneCount} of {steps.length} done</p>
              <ol>
                {steps.map((step, index) => (
                  <li key={step.label} className={styles.step} data-done={step.done}>
                    <span className={styles.stepMark} aria-hidden="true">{step.done ? <Check size={13} /> : String(index + 1).padStart(2, "0")}</span>
                    <span className={styles.stepText}>{step.label}<span className="sr-only">{step.done ? " (done)" : ""}</span></span>
                    {step.done ? (
                      <span className={styles.stepDone} aria-hidden="true">Done</span>
                    ) : step.href ? (
                      <Link href={step.href} className={cn(styles.stepLink, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
                        {step.action} <ArrowRight size={12} aria-hidden="true" />
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>

            <section className={cn(styles.card, styles.sprockets)} aria-labelledby="credits-title">
              <p className={house.eyebrow}>Credits</p>
              <h2 id="credits-title" className={styles.cardTitle}>Your details</h2>
              <dl className={styles.credits}>
                <div className={styles.credit}><dt>Starring</dt><dd>{account.name}</dd></div>
                <div className={styles.credit}><dt>Contact</dt><dd>{account.email}</dd></div>
                <div className={styles.credit}><dt>Pass</dt><dd>{isAdmin ? "Admin" : "Member"}</dd></div>
                <div className={styles.credit}><dt>Delivery</dt><dd>Added at checkout</dd></div>
              </dl>
              <p className={cn(house.fine, "mt-4")}><ShieldCheck className="size-3.5" aria-hidden="true" /> Preview mode: your account details stay on this device.</p>
            </section>
          </aside>
        </div>

        {showing.length > 0 ? (
          <section className="mt-16 border-t border-border pt-12 lg:mt-20" aria-labelledby="showing-title">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className={house.eyebrow}>New in the house</p>
                <h2 id="showing-title" className="mt-3 font-display text-5xl leading-none tracking-wide uppercase sm:text-6xl">Also showing</h2>
              </div>
              <Link href="/shop" className="inline-flex min-h-11 items-center gap-3 self-start text-xs font-bold tracking-[0.12em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:self-auto">View all clothing <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
            <div className={cn(productGridClass, "mt-10 gap-y-14 lg:grid-cols-4 xl:grid-cols-4 xl:gap-x-6")}>
              {showing.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index + 1} variant="cinema" />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function ReelTile({ href, icon: Icon, label, value, note, frames }: { href: string; icon: typeof Heart; label: string; value: string; note: string; frames: Frame[] }) {
  const visible = frames.slice(0, 4);
  const extra = frames.length - visible.length;

  return (
    <Link href={href} className={cn(styles.tile, styles.sprockets, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
      <span className={styles.tileHead}>
        <span className={styles.tileIcon}><Icon size={16} aria-hidden="true" /></span>
        <span className={styles.tileLabel}>{label}</span>
        <ArrowRight size={16} className={styles.tileArrow} aria-hidden="true" />
      </span>
      <span>
        <span className={cn(styles.tileValue, "block")}>{value}</span>
        <span className={cn(styles.tileNote, "block")}>{note}</span>
      </span>
      <span className={styles.strip} aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => {
          const frame = visible[index];
          if (!frame) return <span key={`empty-${index}`} className={styles.frame} data-empty="true" />;
          return (
            <span key={frame.id} className={styles.frame}>
              <Image src={frame.image} alt="" fill sizes="80px" className="object-cover" />
              {index === 3 && extra > 0 ? <span className={styles.frameMore}>+{extra}</span> : null}
            </span>
          );
        })}
      </span>
    </Link>
  );
}
