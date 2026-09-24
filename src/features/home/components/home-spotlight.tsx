"use client";

import Link from "next/link";
import { useReducedMotion } from "motion/react";
import Magnet from "@/components/react-bits/Magnet";
import TiltedCard from "@/components/react-bits/TiltedCard";
import ScrollReveal from "@/components/react-bits/ScrollReveal";
import { getAllProducts } from "@/features/catalog/data";
import { formatInrFromPaise } from "@/lib/money";

/** Spotlight using React Bits TiltedCard — one hero product, desktop tilt. */
export function HomeSpotlight() {
  const reduceMotion = useReducedMotion();
  const product = getAllProducts()[0];
  if (!product) return null;

  return (
    <section className="border-y border-border bg-surface px-6 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Spotlight
          </p>
          <ScrollReveal
            baseOpacity={0.15}
            baseRotation={2}
            blurStrength={3}
            containerClassName="mb-0"
            textClassName="font-display text-4xl tracking-tight text-foreground sm:text-6xl leading-[0.95]"
          >
            {`${product.name} takes the frame.`}
          </ScrollReveal>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
            {product.summary} Listed at{" "}
            {formatInrFromPaise(product.pricePaise)} on the live catalog.
          </p>
          <Magnet
            padding={50}
            magnetStrength={3.2}
            disabled={!!reduceMotion}
            wrapperClassName="mt-8 inline-flex"
          >
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-foreground px-7 text-sm font-semibold text-background transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              View this drop
            </Link>
          </Magnet>
        </div>

        <div className="flex justify-center lg:justify-end">
          <TiltedCard
            imageSrc={product.image}
            altText={product.alt}
            captionText={product.name}
            containerHeight="min(62vh, 520px)"
            containerWidth="min(100%, 380px)"
            imageHeight="min(62vh, 520px)"
            imageWidth="min(100%, 380px)"
            rotateAmplitude={reduceMotion ? 0 : 10}
            scaleOnHover={reduceMotion ? 1 : 1.05}
            showMobileWarning={false}
            showTooltip={!reduceMotion}
          />
        </div>
      </div>
    </section>
  );
}
