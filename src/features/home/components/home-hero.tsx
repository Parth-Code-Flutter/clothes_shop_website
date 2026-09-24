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

/** Rockstar VI–style pinned opener — cinematic stills, scrubbed by Lenis/GSAP. */
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
      if (!root || !stage || reduceMotion) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
          pin: stage,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.set(slideARef.current, { scale: 1.2, opacity: 1 });
      gsap.set(slideBRef.current, { scale: 1.25, opacity: 0 });
      gsap.set(giantRef.current, { opacity: 0, yPercent: 20, scale: 0.9 });
      gsap.set(copyRef.current, { opacity: 1, y: 0 });
      gsap.set(veilRef.current, { opacity: 0.65 });
      gsap.set(progressRef.current, { scaleX: 0 });

      tl.to(slideARef.current, { scale: 1, ease: "none", duration: 0.4 }, 0)
        .to(veilRef.current, { opacity: 0.4, ease: "none", duration: 0.3 }, 0)
        .to(
          giantRef.current,
          { opacity: 0.18, yPercent: 0, scale: 1, ease: "none", duration: 0.35 },
          0.12,
        )
        .to(
          slideBRef.current,
          { opacity: 1, scale: 1.08, ease: "none", duration: 0.35 },
          0.38,
        )
        .to(
          slideARef.current,
          { opacity: 0, scale: 1.06, ease: "none", duration: 0.28 },
          0.42,
        )
        .to(
          copyRef.current,
          { opacity: 0, y: -56, ease: "none", duration: 0.28 },
          0.52,
        )
        .to(
          giantRef.current,
          { opacity: 0.5, scale: 1.1, yPercent: -10, ease: "none", duration: 0.35 },
          0.52,
        )
        .to(slideBRef.current, { scale: 1, ease: "none", duration: 0.35 }, 0.52)
        .to(veilRef.current, { opacity: 0.2, ease: "none", duration: 0.28 }, 0.58)
        .to(progressRef.current, { scaleX: 1, ease: "none", duration: 1 }, 0);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: rootRef, dependencies: [reduceMotion] },
  );

  return (
    <section
      id="opener"
      ref={rootRef}
      className={reduceMotion ? "relative bg-[#05070f]" : "relative h-[260vh] bg-[#05070f]"}
    >
      <div
        ref={stageRef}
        className="relative flex h-[100svh] items-end overflow-hidden sm:items-center"
      >
        <div ref={slideARef} className="absolute inset-0 will-change-transform">
          <Image
            src="/images/homepage/slide-1.png"
            alt="House of Bollywood oversized graphic tees"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[78%_center] lg:object-right"
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
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[78%_center] lg:object-right"
          />
        </div>

        <div
          ref={veilRef}
          className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20 will-change-opacity sm:bg-gradient-to-r sm:from-black sm:via-black/55 sm:to-transparent"
          aria-hidden="true"
        />

        <p
          ref={giantRef}
          aria-hidden="true"
          className={
            reduceMotion
              ? "hidden"
              : "pointer-events-none absolute inset-x-0 bottom-[6%] z-[1] select-none text-center font-display text-[clamp(4.5rem,18vw,15rem)] leading-[0.78] tracking-[-0.03em] text-white will-change-transform"
          }
        >
          BOLLYWOOD
        </p>

        <div
          ref={copyRef}
          className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 pb-20 pt-32 will-change-transform sm:px-8 lg:pb-24"
        >
          <div className="max-w-xl text-white">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.32em] text-accent uppercase">
              House of Bollywood
            </p>
            {reduceMotion ? (
              <p className="text-[10px] font-semibold tracking-[0.28em] text-white/70 uppercase">
                Feature presentation
              </p>
            ) : (
              <ShinyText
                text="FEATURE PRESENTATION"
                speed={2.2}
                color="rgba(255,255,255,0.5)"
                shineColor="#ffffff"
                className="text-[10px] font-semibold tracking-[0.28em]"
              />
            )}

            <Image
              src="/brand/house-of-bollywood-logo.png"
              alt={siteConfig.name}
              width={1024}
              height={341}
              priority
              className="mt-6 h-12 w-auto sm:h-16"
            />

            <h1 className="mt-8 font-display text-[clamp(3.5rem,11vw,7rem)] leading-[0.86] tracking-tight">
              Off screen.
              <span className="block text-white/55">On you.</span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/70 sm:text-base">
              Pop-culture graphic tees. Scroll the premiere — then wear the cast.
              Live catalog only.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Magnet padding={50} magnetStrength={3.4} disabled={!!reduceMotion}>
                <Link
                  href="/shop"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Enter the shop
                </Link>
              </Magnet>
              <a
                href="#look"
                className="text-sm font-semibold text-white/75 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                An extended look
              </a>
            </div>
          </div>
        </div>

        {!reduceMotion ? (
          <div className="absolute inset-x-0 bottom-0 z-[3] h-0.5 bg-white/10" aria-hidden="true">
            <div ref={progressRef} className="h-full origin-left bg-accent will-change-transform" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
