"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import BlurText from "@/components/react-bits/BlurText";
import Magnet from "@/components/react-bits/Magnet";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { getAllProducts } from "@/features/catalog/data";
import { formatInrFromPaise } from "@/lib/money";
import { siteConfig } from "@/config/site";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

const MARQUEE = [
  "Now showing",
  siteConfig.name,
  "Graphic tees",
  "₹650",
  "Junagadh",
  "Pop culture",
] as const;

export function HomeMarquee() {
  const reduceMotion = useReducedMotion();
  const loop = [...MARQUEE, ...MARQUEE, ...MARQUEE];

  return (
    <section
      aria-label="Credits marquee"
      className="overflow-hidden border-y border-border bg-foreground text-background"
      data-lenis-prevent-wheel
    >
      <div
        className={
          reduceMotion
            ? "flex gap-10 overflow-x-auto whitespace-nowrap px-4 py-3.5"
            : "flex w-max animate-marquee gap-10 whitespace-nowrap py-3.5"
        }
      >
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="font-display text-xl tracking-[0.16em] uppercase sm:text-2xl"
          >
            {item}
            <span className="ml-10 text-accent" aria-hidden="true">
              ●
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}

function CastCard({
  product,
  index,
  className,
  featured = false,
}: {
  product: CatalogProduct;
  index: number;
  className?: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group relative block overflow-hidden bg-[#0a0705] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
        className,
      )}
    >
      <Image
        src={product.image}
        alt={product.alt}
        fill
        sizes={
          featured
            ? "(max-width: 1024px) 100vw, 58vw"
            : "(max-width: 1024px) 50vw, 28vw"
        }
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <span className="font-mono text-[10px] tracking-[0.2em] text-white/70 uppercase">
          Scene {String(index + 1).padStart(2, "0")}
        </span>
        {featured ? (
          <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-accent-foreground uppercase">
            Lead
          </span>
        ) : null}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p
          className={cn(
            "font-display tracking-wide text-white",
            featured ? "text-3xl sm:text-5xl" : "text-2xl sm:text-3xl",
          )}
        >
          {product.name}
        </p>
        <p className="mt-1 text-sm text-gold">
          {formatInrFromPaise(product.pricePaise)}
        </p>
      </div>
    </Link>
  );
}

export function HomeDropStage() {
  const products = getAllProducts();
  const reduceMotion = useReducedMotion();
  const [lead, second, third, ...rest] = products;

  if (!lead || !second || !third) {
    return null;
  }

  return (
    <section id="tonight" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              Tonight&apos;s cast
            </p>
            <BlurText
              text="One board. Five characters."
              as="h2"
              delay={80}
              animateBy="words"
              direction="bottom"
              className="text-3xl font-semibold tracking-[-0.045em] text-foreground sm:text-5xl"
            />
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted">
            Editorial cast grid — tap a poster, open the drop. Same live catalog,
            no fake extras.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2 lg:gap-4">
          <RevealOnScroll className="relative min-h-[420px] sm:min-h-[520px] lg:col-span-7 lg:row-span-2">
            <CastCard product={lead} index={0} featured className="absolute inset-0" />
          </RevealOnScroll>

          <RevealOnScroll
            delay={0.06}
            className="relative min-h-[280px] lg:col-span-5"
          >
            <CastCard product={second} index={1} className="absolute inset-0" />
          </RevealOnScroll>

          <RevealOnScroll
            delay={0.1}
            className="relative min-h-[280px] lg:col-span-5"
          >
            <CastCard product={third} index={2} className="absolute inset-0" />
          </RevealOnScroll>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {rest.map((product, index) => (
            <RevealOnScroll
              key={product.id}
              delay={0.04 * index}
              className="relative min-h-[320px]"
            >
              <CastCard
                product={product}
                index={index + 3}
                className="absolute inset-0"
              />
            </RevealOnScroll>
          ))}

          <Magnet
            padding={40}
            magnetStrength={4}
            disabled={!!reduceMotion}
            wrapperClassName="sm:col-span-2 lg:col-span-1"
            innerClassName="h-full"
          >
            <Link
              href="/shop"
              className="group flex min-h-[320px] flex-col justify-between border border-border bg-surface p-6 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                Scene {String(rest.length + 4).padStart(2, "0")}
              </p>
              <div>
                <p className="font-display text-4xl tracking-wide text-foreground">
                  Full board
                </p>
                <p className="mt-2 max-w-[16rem] text-sm leading-6 text-muted">
                  Open shop for categories, sort, and every live tee in one place.
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                  Enter shop
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </div>
            </Link>
          </Magnet>
        </div>
      </div>
    </section>
  );
}
