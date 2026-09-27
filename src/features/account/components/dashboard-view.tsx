"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart, MapPin, Package, ShieldCheck, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { useEffect } from "react";
import { useAccount } from "@/features/account/account-provider";
import { useCart } from "@/features/cart/cart-provider";
import { useWishlist } from "@/features/wishlist/wishlist-provider";

export function DashboardView() {
  const router = useRouter();
  const { account, signedIn, signOut } = useAccount();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    if (!signedIn) router.replace("/account");
  }, [router, signedIn]);

  if (!signedIn || !account) {
    return <div className="min-h-[60vh] bg-background" aria-label="Returning to sign in" />;
  }

  return (
    <div className="bg-background text-foreground">
      <header className="border-b border-border bg-[#180805] px-5 py-10 text-white sm:px-8 lg:px-12 lg:py-14">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-end justify-between gap-6">
          <div><p className="text-[10px] font-bold tracking-[0.3em] text-[#ff5c53] uppercase">Your private wardrobe</p><h1 className="mt-3 font-display text-6xl leading-none tracking-wide sm:text-8xl">Hey, {account.name.split(" ")[0]}.</h1></div>
          <button type="button" onClick={() => { signOut(); router.replace("/account"); }} className="min-h-11 border border-white/25 px-5 text-xs font-bold tracking-[0.14em] uppercase hover:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Sign out</button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1360px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-12 lg:py-14">
        <aside className="h-fit overflow-hidden border border-border bg-[#f3eee7] text-[#160604] dark:bg-surface dark:text-foreground">
          <div className="bg-[#180805] p-6 text-white"><p className="text-[9px] font-bold tracking-[.24em] text-[#ff5c53] uppercase">House pass · 001</p><p className="mt-8 font-display text-4xl tracking-wide">Inner circle</p><p className="mt-2 text-xs leading-5 text-white/60">Early access, saved edits, and a faster way through the house.</p></div>
          <div className="p-6">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#180805] text-white dark:bg-background"><UserRound size={19} aria-hidden="true" /></span>
          <div className="mt-5 flex items-center justify-between gap-3"><p className="font-display text-3xl tracking-wide">{account.name}</p><span className="border border-black/15 px-2 py-1 font-mono text-[8px] tracking-[0.14em] uppercase dark:border-white/15">{account.role}</span></div>
          <p className="mt-1 break-all text-xs opacity-60">{account.email}</p>
          <div className="mt-6 border-t border-black/10 pt-5 dark:border-white/10"><div className="flex items-center justify-between text-[10px] font-bold uppercase"><span>Profile strength</span><span>75%</span></div><div className="mt-2 h-1 bg-black/10 dark:bg-white/10"><span className="block h-full w-3/4 bg-accent"/></div><p className="mt-3 text-[11px] leading-5 opacity-60">Add an address at checkout to complete your profile.</p></div>
          </div>
        </aside>

        <section aria-labelledby="account-overview-title">
          <p className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">Account overview</p>
          <h2 id="account-overview-title" className="mt-2 font-display text-5xl tracking-wide">Your scene, organised.</h2>
          <p className="mt-3 text-sm text-muted">Continue exactly where you left off.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <DashboardTile href="/cart" icon={ShoppingBag} label="Shopping bag" value={`${itemCount} ${itemCount === 1 ? "piece" : "pieces"}`} action="Open bag" />
            <DashboardTile href="/wishlist" icon={Heart} label="Saved edit" value={`${wishlistCount} saved`} action="View saves" />
          </div>
          <div className="mt-8 border border-border p-6 sm:p-8">
            <div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface"><Package size={18} aria-hidden="true" /></span><div><p className="font-display text-3xl tracking-wide">No orders yet.</p><p className="mt-2 max-w-lg text-sm leading-6 text-muted">When live checkout is connected, order status, delivery progress, invoices, and returns will live here.</p><Link href="/shop" className="mt-5 inline-flex min-h-10 items-center gap-3 text-xs font-bold tracking-[0.12em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Continue shopping <ArrowRight size={15} aria-hidden="true" /></Link></div></div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <InfoCard icon={UserRound} eyebrow="Personal details" title={account.name} body={account.email} action="Account identity is ready" />
            <InfoCard icon={MapPin} eyebrow="Delivery" title="No saved address" body="Your first checkout can save a preferred delivery address." action="Add during checkout" />
            <InfoCard icon={Sparkles} eyebrow="Style profile" title="Build your edit" body="Save pieces you like and the wardrobe will become more personal." action="Explore recommendations" href="/shop" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border border-border bg-surface p-5"><div className="flex items-center gap-3"><ShieldCheck size={20} className="text-accent"/><div><p className="text-xs font-bold">Privacy, handled clearly.</p><p className="mt-1 text-[11px] text-muted">This preview keeps account data on this device only.</p></div></div><Link href="/shop" className="inline-flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase">Need help? Visit the shop <ArrowRight size={13}/></Link></div>
        </section>
      </div>
    </div>
  );
}

function DashboardTile({ href, icon: Icon, label, value, action }: { href: string; icon: typeof Heart; label: string; value: string; action: string }) {
  return <Link href={href} className="group flex min-h-40 flex-col justify-between border border-border p-5 transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><div className="flex items-start justify-between"><Icon size={19} aria-hidden="true" /><ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></div><div><p className="text-[10px] font-bold tracking-[0.16em] text-muted uppercase">{label}</p><p className="mt-1 font-display text-4xl tracking-wide">{value}</p><span className="mt-2 block text-[11px] text-muted">{action}</span></div></Link>;
}

function InfoCard({ icon: Icon, eyebrow, title, body, action, href }: { icon: typeof UserRound; eyebrow: string; title: string; body: string; action: string; href?: string }) {
  const content = <><Icon size={18} aria-hidden="true"/><p className="mt-7 text-[9px] font-bold tracking-[.16em] text-accent uppercase">{eyebrow}</p><p className="mt-2 font-display text-2xl tracking-wide">{title}</p><p className="mt-2 min-h-10 text-[11px] leading-5 text-muted">{body}</p><span className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase">{action}{href ? <ArrowRight size={12}/> : null}</span></>;
  return href ? <Link href={href} className="group border border-border p-5 hover:border-foreground">{content}</Link> : <div className="border border-border p-5">{content}</div>;
}
