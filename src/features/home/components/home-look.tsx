"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

export function HomeLook() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-[#1a3a6e]">
      <div className="mx-auto grid min-h-[min(70svh,680px)] max-w-[1440px] lg:grid-cols-2">
        <div className="relative order-2 min-h-[42vh] lg:order-1 lg:min-h-full">
          <Image
            src="/images/homepage/slide-2.png"
            alt="More House of Bollywood graphic tee drops"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center lg:object-left"
          />
        </div>

        <div className="order-1 flex flex-col justify-center bg-background px-6 py-14 sm:px-10 sm:py-20 lg:order-2">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
            className="max-w-md"
          >
            <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              More from the board
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
              Same house.
              <span className="mt-1 block text-muted">Different energy.</span>
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted">
              Yellow bats, green rage, and the rest of the live drop — open shop
              when you&apos;re ready.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex min-h-12 w-fit items-center justify-center rounded-full bg-foreground px-7 text-sm font-semibold text-background transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              Open shop
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
