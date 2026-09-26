"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { catalogCategories, getAllProducts } from "@/features/catalog/data";
import { formatInrFromPaise } from "@/lib/money";

/**
 * The edit — studio product shots on a dark stage, captions beside the cloth.
 */
export function HomeDropStage() {
  const products = getAllProducts();
  const [featured, ...rest] = products;
  if (!featured) return null;

  return (
    <section id="cast" className="bg-surface text-foreground">
      <div className="mx-auto max-w-[1440px] px-6 py-24 sm:px-8 sm:py-32 lg:pr-20">
        <RevealOnScroll>
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
            <p className="text-[10px] font-semibold tracking-[0.34em] text-gold uppercase">
              02 — The edit
            </p>
            <p className="text-sm text-muted">
              {products.length} graphic tees · {formatInrFromPaise(featured.pricePaise)}
            </p>
          </div>
          <h2 className="mt-10 max-w-3xl font-display text-5xl leading-[0.92] tracking-tight sm:text-7xl">
            Only in the house.
          </h2>
        </RevealOnScroll>

        <RevealOnScroll className="mt-14">
          <article className="grid overflow-hidden border border-border bg-background lg:grid-cols-12">
            <Link
              href={`/product/${featured.slug}`}
              className="relative block min-h-[420px] bg-footer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:min-h-[520px] lg:col-span-7 lg:min-h-[640px]"
            >
              <Image
                src={featured.image}
                alt={featured.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-contain object-center p-6 sm:p-10"
              />
            </Link>
            <div className="flex flex-col justify-between gap-10 px-6 py-8 sm:px-10 sm:py-12 lg:col-span-5">
              <div>
                <p className="font-mono text-[10px] tracking-[0.28em] text-gold uppercase">
                  01 / Graphic tee
                </p>
                <h3 className="mt-4 font-display text-4xl tracking-wide sm:text-6xl">
                  {featured.name}
                </h3>
                <p className="mt-5 max-w-sm text-sm leading-7 text-muted">
                  {featured.summary}
                </p>
              </div>
              <div className="flex items-end justify-between gap-4 border-t border-border pt-6">
                <p className="font-display text-3xl tracking-wide">
                  {formatInrFromPaise(featured.pricePaise)}
                </p>
                <Link
                  href={`/product/${featured.slug}`}
                  className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  View piece
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </div>
          </article>
        </RevealOnScroll>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((product, index) => (
            <RevealOnScroll key={product.id} delay={Math.min(index * 0.05, 0.16)}>
              <article className="group flex h-full flex-col border border-border bg-background">
                <Link
                  href={`/product/${product.slug}`}
                  className="relative block aspect-[3/4] bg-footer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <Image
                    src={product.image}
                    alt={product.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain object-center p-4 transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between gap-4 px-4 py-5">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
                      {String(index + 2).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 font-display text-2xl tracking-wide">
                      <Link
                        href={`/product/${product.slug}`}
                        className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                      >
                        {product.name}
                      </Link>
                    </h3>
                  </div>
                  <p className="text-sm text-foreground">
                    {formatInrFromPaise(product.pricePaise)}
                  </p>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll className="mt-16 border-t border-border pt-8">
          <p className="text-[10px] font-semibold tracking-[0.28em] text-muted uppercase">
            Shelves
          </p>
          <ul className="mt-5 divide-y divide-border border-y border-border">
            {catalogCategories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <span className="font-display text-2xl tracking-wide sm:text-3xl">
                  {category.name}
                </span>
                <span className="text-[10px] font-semibold tracking-[0.22em] text-gold uppercase">
                  {category.available ? "In the house" : "Next"}
                </span>
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      </div>
    </section>
  );
}

export function HomeMarquee() {
  return null;
}
