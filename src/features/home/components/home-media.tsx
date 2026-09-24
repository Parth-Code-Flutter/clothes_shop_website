"use client";

import Image from "next/image";
import Link from "next/link";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { getAllProducts } from "@/features/catalog/data";

/** Media grid — themed section; hover labels stay light on photo scrims. */
export function HomeMedia() {
  const products = getAllProducts();
  const shots = products.flatMap((product) =>
    product.gallery.slice(0, 2).map((src, index) => ({
      src,
      alt: product.alt,
      name: product.name,
      href: `/product/${product.slug}`,
      key: `${product.id}-${index}`,
    })),
  );

  return (
    <section
      id="media"
      className="bg-surface px-6 py-20 text-foreground sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-[1440px]">
        <RevealOnScroll>
          <p className="text-[10px] font-semibold tracking-[0.32em] text-accent uppercase">
            Media & artwork
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl tracking-tight sm:text-6xl">
            Download the vibe.
            <span className="block text-muted">Wear the print.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted">
            Official product stills from the live House of Bollywood catalog.
          </p>
        </RevealOnScroll>

        <div className="mt-12 columns-1 gap-3 sm:columns-2 lg:columns-3 lg:gap-4">
          {shots.map((shot, index) => (
            <RevealOnScroll
              key={shot.key}
              delay={Math.min(index * 0.03, 0.2)}
              className="mb-3 break-inside-avoid lg:mb-4"
            >
              <Link
                href={shot.href}
                className="group relative block overflow-hidden border border-border bg-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={700}
                  height={910}
                  className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-4 text-xs font-semibold tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:opacity-100">
                  {shot.name}
                </span>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
