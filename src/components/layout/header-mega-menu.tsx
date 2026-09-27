"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useRef } from "react";
import { clothingGroups } from "@/config/navigation";
import { getAllCategories, getProductsByCategory } from "@/features/catalog/data";
import styles from "./header-mega-menu.module.css";

const piecesBySlug = new Map(getAllCategories().map((category) => [category.slug, getProductsByCategory(category.id).length]));

function piecesFor(href: string) {
  const slug = new URLSearchParams(href.split("?")[1]).get("category");
  return slug ? piecesBySlug.get(slug) : undefined;
}

type HeaderMegaMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Men navigation with mouse, keyboard, and touch-friendly disclosure behaviour. */
export function HeaderMegaMenu({ open, onOpenChange }: HeaderMegaMenuProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => onOpenChange(false), 180);
  }, [cancelClose, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      cancelClose();
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [cancelClose, open, onOpenChange]);

  return (
    <div
      ref={root}
      onMouseEnter={() => {
        cancelClose();
        onOpenChange(true);
      }}
      onMouseLeave={scheduleClose}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onOpenChange(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => onOpenChange(true)}
        className="group relative flex min-h-11 items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        Men
        <ChevronDown size={13} aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`} />
        <span className={`absolute bottom-0 h-0.5 bg-linear-to-r from-accent to-[var(--rail)] transition-all ${open ? "w-10" : "w-0 group-hover:w-10"}`} aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={id}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className={`${styles.stage} fixed inset-x-0 top-[75px]`}
        >
          <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-8 py-9 xl:px-12">
            <Link href="/shop" onClick={() => onOpenChange(false)} className={`${styles.poster} group col-span-4 min-h-[340px] text-white focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent`}>
              <Image src="/images/products/t-shirts/black-panther-ivory-tee/back.jpg" alt="Ivory oversized tee with Black Panther back artwork" fill sizes="33vw" className="-z-10 object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
              <span className="absolute inset-0 -z-10 bg-linear-to-t from-[#0b0503]/95 via-[#0b0503]/30 to-[#0b0503]/10" aria-hidden="true" />
              <span className={styles.posterBulbs} aria-hidden="true" />
              <span className={`${styles.posterBulbs} ${styles.bottom}`} aria-hidden="true" />
              <span className={styles.ribbon}>Now showing</span>
              <span className="absolute inset-x-0 bottom-0 px-7 pt-7 pb-9">
                <span className={styles.presents}>Feature presentation · The men&apos;s edit</span>
                <span className={`${styles.headline} mt-3 block font-display text-5xl leading-[0.88] tracking-wide uppercase`}>Dress for<br /><em>the entrance.</em></span>
                <span className={`${styles.admitCta} mt-5`}>Shop all men <ArrowUpRight size={14} aria-hidden="true" /></span>
              </span>
            </Link>

            <div className={`${styles.programme} col-span-4 pr-8`}>
              <div className="flex items-end justify-between pb-4">
                <div>
                  <p className={styles.eyebrow}>Tonight&apos;s programme</p>
                  <p className="mt-1 font-display text-3xl tracking-wide uppercase">Shop clothing</p>
                </div>
                <span className="font-mono text-[10px] text-muted">Reels 01—{String(clothingGroups.length).padStart(2, "0")}</span>
              </div>
              <ul className="border-t border-[color:var(--hairline)]">
                {clothingGroups.map((group, index) => {
                  const pieces = piecesFor(group.href);
                  return (
                    <li key={group.label}>
                      <Link href={group.href} onClick={() => onOpenChange(false)} className={`${styles.reel} focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}>
                        <span className={`${styles.reelNo} font-mono`} aria-hidden="true">0{index + 1}</span>
                        <span className={styles.reelName}>{group.label}</span>
                        {pieces ? <span className={`${styles.reelCount} font-mono`}>{pieces} pieces</span> : <span />}
                        <ArrowRight size={14} aria-hidden="true" className={styles.reelArrow} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="col-span-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className={styles.eyebrow}>Coming attractions</p>
                  <p className="mt-1 font-display text-3xl tracking-wide uppercase">Start here</p>
                </div>
                <Link href="/shop" onClick={() => onOpenChange(false)} className={styles.viewAll}>View all</Link>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <MenuEdit reel="Trailer 01" image="/images/products/t-shirts/messi-10-ivory-tee/back.jpg" label="Graphic tees" href="/shop?category=t-shirts" onClick={() => onOpenChange(false)} />
                <MenuEdit reel="Trailer 02" image="/images/products/jeans/belted-light-wash-jeans/front.jpg" label="Denim rotation" href="/shop?category=jeans" onClick={() => onOpenChange(false)} />
              </div>
              <p className={styles.admit}>
                <span className={styles.admitStub}>Admit<br />one</span>
                <span className="px-4 py-3 text-xs leading-5 text-muted">Explore the full wardrobe or jump directly into the category you came for.</span>
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuEdit({ reel, image, label, href, onClick }: { reel: string; image: string; label: string; href: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className={`${styles.trailer} group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent`}>
      <span className={styles.film}>
        <span className="relative block aspect-[4/5] overflow-hidden">
          <Image src={image} alt="" fill sizes="15vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
        </span>
      </span>
      <span className={`${styles.trailerTag} mt-2.5 block`}>{reel}</span>
      <span className="mt-0.5 flex items-center justify-between text-xs font-semibold group-hover:text-accent">{label}<ArrowUpRight size={13} aria-hidden="true" /></span>
    </Link>
  );
}
