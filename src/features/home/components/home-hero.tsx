"use client";

import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";
import { useRef } from "react";
import Magnet from "@/components/react-bits/Magnet";
import ShinyText from "@/components/react-bits/ShinyText";
import { siteConfig } from "@/config/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Premium pinned scroll hero — Dribbble/Pinterest immersive campaign feel.
 * Scroll drives scale, dual-slide crossfade, giant type, and copy exit.
 */

export function HomeHero() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slideARef = useRef<HTMLDivElement>(null);
  const slideBRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const giantRef = useRef<HTMLParagraphElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const stage = stageRef.current;
      if (!root || !stage) return;

      if (reduceMotion) {
        gsap.set(
          [slideARef.current, slideBRef.current, copyRef.current, giantRef.current],
          { clearProps: "all" },
        );
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.65,
          pin: stage,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.set(slideARef.current, { scale: 1.18, opacity: 1 });
      gsap.set(slideBRef.current, { scale: 1.22, opacity: 0 });
      gsap.set(giantRef.current, { opacity: 0, yPercent: 18, scale: 0.92 });
      gsap.set(copyRef.current, { opacity: 1, y: 0 });
      gsap.set(veilRef.current, { opacity: 0.55 });
      gsap.set(progressRef.current, { scaleX: 0 });

      tl.to(
        slideARef.current,
        { scale: 1, ease: "none", duration: 0.45 },
        0,
      )
        .to(
          veilRef.current,
          { opacity: 0.35, ease: "none", duration: 0.35 },
          0,
        )
        .to(
          giantRef.current,
          { opacity: 0.2, yPercent: 0, scale: 1, ease: "none", duration: 0.35 },
          0.15,
        )
        .to(
          slideBRef.current,
          { opacity: 1, scale: 1.05, ease: "none", duration: 0.35 },
          0.4,
        )
        .to(
          slideARef.current,
          { opacity: 0, scale: 1.08, ease: "none", duration: 0.3 },
          0.45,
        )
        .to(
          copyRef.current,
          { opacity: 0, y: -48, ease: "none", duration: 0.28 },
          0.55,
        )
        .to(
          giantRef.current,
          {
            opacity: 0.55,
            scale: 1.08,
            yPercent: -8,
            ease: "none",
            duration: 0.35,
          },
          0.55,
        )
        .to(
          slideBRef.current,
          { scale: 1, ease: "none", duration: 0.35 },
          0.55,
        )
        .to(
          veilRef.current,
          { opacity: 0.15, ease: "none", duration: 0.3 },
          0.6,
        )
        .to(
          progressRef.current,
          { scaleX: 1, ease: "none", duration: 1 },
          0,
        );

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: rootRef, dependencies: [reduceMotion] },
  );

  return (
    <section
      ref={rootRef}
      className={
        reduceMotion
          ? "relative bg-[#163568]"
          : "relative h-[240vh] bg-[#163568]"
      }
    >
      <div
        ref={stageRef}
        className="relative flex h-[100svh] items-end overflow-hidden sm:items-center"
      >
        <div
          ref={slideARef}
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src="/images/homepage/slide-1.png"
            alt="House of Bollywood oversized graphic tees on a blue field"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[78%_center] sm:object-[70%_center] lg:object-right"
          />
        </div>
        <div
          ref={slideBRef}
          className={
            reduceMotion
              ? "absolute inset-0 hidden"
              : "absolute inset-0 will-change-transform"
          }
          aria-hidden="true"
        >
          <Image
            src="/images/homepage/slide-2.png"
            alt="More House of Bollywood graphic tee drops on a blue field"
            fill
            sizes="100vw"
            className="object-cover object-[78%_center] sm:object-[70%_center] lg:object-right"
          />
        </div>

        <div
          ref={veilRef}
          className="absolute inset-0 bg-gradient-to-r from-[#0a1838]/90 via-[#0d2248]/45 to-transparent will-change-opacity"
          aria-hidden="true"
        />

        <p
          ref={giantRef}
          aria-hidden="true"
          className={
            reduceMotion
              ? "pointer-events-none absolute inset-x-0 bottom-[8%] z-[1] hidden select-none text-center font-display text-[clamp(4.5rem,18vw,16rem)] leading-[0.8] tracking-[-0.03em] text-white"
              : "pointer-events-none absolute inset-x-0 bottom-[8%] z-[1] select-none text-center font-display text-[clamp(4.5rem,18vw,16rem)] leading-[0.8] tracking-[-0.03em] text-white will-change-transform"
          }
        >
          BOLLYWOOD
        </p>

        <div
          ref={copyRef}
          className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 pb-16 pt-28 will-change-transform sm:px-8 sm:pb-20 lg:pb-24"
        >
          <div className="max-w-lg text-white">
            <div className="mb-4">
              {reduceMotion ? (
                <p className="text-[10px] font-semibold tracking-[0.28em] text-white/80 uppercase">
                  Feature presentation
                </p>
              ) : (
                <ShinyText
                  text="FEATURE PRESENTATION"
                  speed={2.4}
                  color="rgba(255,255,255,0.55)"
                  shineColor="#ffffff"
                  className="text-[10px] font-semibold tracking-[0.28em]"
                />
              )}
            </div>

            <Image
              src="/brand/house-of-bollywood-logo.png"
              alt={siteConfig.name}
              width={1024}
              height={341}
              priority
              className="h-12 w-auto sm:h-[4.25rem]"
            />

            <h1 className="mt-7 font-display text-[clamp(3.25rem,10vw,6.75rem)] leading-[0.88] tracking-tight">
              Off screen.
              <span className="block text-white/60">On you.</span>
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/75 sm:text-base">
              Scroll the premiere — then shop the live cast. Real graphic tees.
              Real prices.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Magnet
                padding={60}
                magnetStrength={3.5}
                disabled={!!reduceMotion}
                wrapperClassName="inline-flex"
              >
                <Link
                  href="/shop"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Shop the board
                </Link>
              </Magnet>
              <a
                href="#tonight"
                className="text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Tonight&apos;s cast
              </a>
            </div>
          </div>
        </div>

        {!reduceMotion ? (
          <div
            className="absolute inset-x-0 bottom-0 z-[3] h-1 bg-white/15"
            aria-hidden="true"
          >
            <div
              ref={progressRef}
              className="h-full origin-left bg-accent will-change-transform"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
