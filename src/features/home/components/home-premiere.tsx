"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import { getAllProducts } from "@/features/catalog/data";
import type { CatalogProduct } from "@/features/catalog/types";
import { formatInrFromPaise } from "@/lib/money";
import styles from "./home-premiere.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SCENES = ["Curtain up", "Countdown", "Now showing", "Starring you"] as const;

/** Takes one piece from each category in turn so the reel shows the whole wardrobe. */
function reelProducts(count: number) {
  const byCategory = new Map<string, CatalogProduct[]>();
  for (const product of getAllProducts()) {
    byCategory.set(product.categoryId, [...(byCategory.get(product.categoryId) ?? []), product]);
  }
  const queues = [...byCategory.values()];
  const picked: CatalogProduct[] = [];
  for (let round = 0; picked.length < count && queues.some((queue) => queue.length > round); round++) {
    for (const queue of queues) if (queue[round] && picked.length < count) picked.push(queue[round]);
  }
  return picked;
}

const REEL = reelProducts(9);
const TOP_BULBS = 18;
const SIDE_BULBS = 4;

function Bulbs() {
  const row = (count: number, offset: number) =>
    Array.from({ length: count }, (_, index) => <span key={index} className={styles.bulb} data-odd={(index + offset) % 2 === 1 || undefined} />);
  return (
    <span className={styles.bulbs} aria-hidden="true">
      <span className={styles.bulbRowTop}>{row(TOP_BULBS, 0)}</span>
      <span className={styles.bulbRowBottom}>{row(TOP_BULBS, 1)}</span>
      <span className={styles.bulbColLeft}>{row(SIDE_BULBS, 1)}</span>
      <span className={styles.bulbColRight}>{row(SIDE_BULBS, 0)}</span>
    </span>
  );
}

const CONFETTI_COLORS = ["#f59e0b", "#e7bd62", "#f0261e", "#fff1c4", "#ea580c"];

/** Marigold petals and gold foil for the finale; positions are fixed so server and client render the same. */
function Confetti() {
  return (
    <span className={styles.confetti} aria-hidden="true">
      {Array.from({ length: 30 }, (_, index) => (
        <i
          key={index}
          data-petal={index % 3 === 0 || undefined}
          style={{
            "--x": `${(index * 37 + 11) % 100}%`,
            "--c": CONFETTI_COLORS[index % CONFETTI_COLORS.length],
            "--d": `${6 + ((index * 7) % 6)}s`,
            "--delay": `${-((index * 13) % 11)}s`,
            "--drift": `${((index * 29) % 120) - 60}px`,
            "--r": `${360 + ((index * 53) % 540)}deg`,
          } as CSSProperties}
        />
      ))}
    </span>
  );
}

/**
 * Homepage opener staged as a film premiere: curtains part, a vintage leader
 * counts down, the real wardrobe rolls past on a film reel, and the credits
 * end on "Starring you" with a ticket into the shop. Scroll drives every beat.
 */
export function HomePremiere() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const element = root.current;
    if (!element) return;
    const media = gsap.matchMedia();
    media.add(
      // GSAP only runs this callback while at least one condition matches; "all" keeps phones in.
      { all: "all", desktop: "(min-width: 1024px)", reduced: "(prefers-reduced-motion: reduce)" },
      (context) => {
        const { desktop, reduced } = context.conditions!;
        if (reduced) return;
        const q = gsap.utils.selector(element);
        const stage = element.querySelector<HTMLElement>("[data-stage]")!;
        const strip = element.querySelector<HTMLElement>("[data-strip]")!;
        const frames = [...element.querySelectorAll<HTMLElement>("[data-frame]")];
        const count = element.querySelector<HTMLElement>("[data-count]")!;
        const sweep = element.querySelector<HTMLElement>("[data-sweep]")!;
        const label = element.querySelector<HTMLElement>("[data-scene-label]")!;
        const number = element.querySelector<HTMLElement>("[data-scene-number]")!;
        const captionIndex = element.querySelector<HTMLElement>("[data-caption-index]")!;
        const captionName = element.querySelector<HTMLElement>("[data-caption-name]")!;
        const captionPrice = element.querySelector<HTMLElement>("[data-caption-price]")!;
        const left = q('[data-curtain="left"]');
        const right = q('[data-curtain="right"]');
        let scene = -1;
        let live = -1;

        const closed = "polygon(0% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%)";
        gsap.set([left, right], { clipPath: closed });

        const spotlightFrame = () => {
          const middle = stage.getBoundingClientRect().left + stage.clientWidth / 2;
          let best = 0;
          let distance = Infinity;
          frames.forEach((frame, index) => {
            const rect = frame.getBoundingClientRect();
            const gap = Math.abs(rect.left + rect.width / 2 - middle);
            if (gap < distance) { distance = gap; best = index; }
          });
          if (best === live) return;
          live = best;
          frames.forEach((frame, index) => frame.toggleAttribute("data-live", index === best));
          captionIndex.textContent = String(best + 1).padStart(2, "0");
          captionName.textContent = REEL[best].name;
          captionPrice.textContent = formatInrFromPaise(REEL[best].pricePaise);
        };

        const leader = { turns: 0 };
        // Runs on every scrubbed render (not on raw scroll), so the reel geometry is current.
        const onRender = () => {
          const progress = timeline.progress();
          const next = progress < 0.12 ? 0 : progress < 0.36 ? 1 : progress < 0.82 ? 2 : 3;
          if (next !== scene) {
            scene = next;
            label.textContent = SCENES[scene];
            number.textContent = `0${scene + 1}`;
          }
          if (scene === 2) spotlightFrame();
        };
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: onRender,
          scrollTrigger: {
            trigger: element,
            start: () => `top top+=${desktop ? 88 : 72}`,
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(q("[data-cue]"), { autoAlpha: 0, duration: 0.04 }, 0)
          .to(q("[data-sign]"), { yPercent: -30, scale: 0.86, autoAlpha: 0, duration: 0.12, ease: "power2.in" }, 0.02)
          .to(q("[data-spotlights]"), { autoAlpha: 0, duration: 0.08 }, 0.02)
          .to(left, { clipPath: "polygon(0% 0%, 100% 0%, 72% 52%, 34% 84%, 0% 100%)", duration: 0.1, ease: "power1.inOut" }, 0.03)
          .to(right, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 66% 84%, 28% 52%)", duration: 0.1, ease: "power1.inOut" }, 0.03)
          .to(left, { xPercent: -101, scaleX: 0.6, duration: 0.16, ease: "power2.inOut" }, 0.05)
          .to(right, { xPercent: 101, scaleX: 0.6, duration: 0.16, ease: "power2.inOut" }, 0.05)
          .to(q("[data-valance]"), { yPercent: -45, duration: 0.14 }, 0.08)
          .to(q("[data-screen], [data-beam]"), { autoAlpha: 1, duration: 0.06 }, 0.09)
          .to(leader, {
            turns: 3,
            duration: 0.2,
            onUpdate: () => {
              count.textContent = String(Math.min(3, Math.max(1, 3 - Math.floor(leader.turns))));
              sweep.style.setProperty("--sweep", `${((leader.turns % 1) * 360).toFixed(1)}deg`);
            },
          }, 0.14)
          .to(q("[data-flash]"), { autoAlpha: 1, duration: 0.012 }, 0.345)
          .set(q("[data-screen]"), { autoAlpha: 0 }, 0.357)
          .to(q("[data-reel], [data-outline]"), { autoAlpha: 1, duration: 0.01 }, 0.357)
          .to(q("[data-flash]"), { autoAlpha: 0, duration: 0.04 }, 0.36)
          .fromTo(strip, { x: () => stage.clientWidth * 0.9 }, { x: () => -(strip.scrollWidth - stage.clientWidth * 0.1), duration: 0.44 }, 0.36)
          .fromTo(q("[data-outline]"), { xPercent: 0 }, { xPercent: -30, duration: 0.46 }, 0.36)
          .to(q("[data-caption]"), { autoAlpha: 1, duration: 0.04 }, 0.4)
          .to(q("[data-reel]"), { autoAlpha: 0, scale: 1.12, duration: 0.06, ease: "power1.in" }, 0.8)
          .to(q("[data-caption], [data-outline], [data-beam]"), { autoAlpha: 0, duration: 0.05 }, 0.8)
          .to(left, { xPercent: -47, scaleX: 0.75, duration: 0.1, ease: "power2.out" }, 0.83)
          .to(right, { xPercent: 47, scaleX: 0.75, duration: 0.1, ease: "power2.out" }, 0.83)
          .to(q("[data-valance]"), { yPercent: 0, duration: 0.08 }, 0.83)
          .fromTo(q("[data-finale]"), { autoAlpha: 0, y: 40, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.09, ease: "power2.out" }, 0.86)
          .to(q("[data-progress]"), { scaleX: 1, duration: 1 }, 0);

        return () => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
        };
      },
    );

    let active = true;
    document.fonts.ready.then(() => {
      if (active) ScrollTrigger.refresh();
    });
    return () => {
      active = false;
      media.revert();
    };
  }, { scope: root });

  const followLight = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--lx", `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
    event.currentTarget.style.setProperty("--ly", `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
  };

  return (
    <section ref={root} id="opener" className={styles.premiere} aria-label="House of Bollywood premiere">
      <h1 className={styles.srOnly}>House of Bollywood. Main character energy.</h1>
      <div
        data-stage
        className={styles.stage}
        tabIndex={0}
        aria-label="The House of Bollywood premiere. Scroll or use arrow keys to play the show."
        onPointerMove={followLight}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          const story = root.current;
          if (!story) return;
          event.preventDefault();
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          const step = story.offsetHeight * 0.14 * (event.key === "ArrowDown" ? 1 : -1);
          window.scrollBy({ top: step, behavior: reduce ? "auto" : "smooth" });
        }}
      >
        <div data-beam className={styles.beam} aria-hidden="true" />
        <div data-outline className={styles.outlineWord} aria-hidden="true">Now showing ✦ Now showing ✦ Now showing</div>

        <div data-screen className={styles.screen} aria-hidden="true">
          <span className={styles.crossH} />
          <span className={styles.crossV} />
          <div className={styles.leader}>
            <span data-sweep className={styles.sweep} />
            <span className={styles.ringOuter} />
            <span className={styles.ringInner} />
            <span data-count className={styles.count}>3</span>
          </div>
          <span className={styles.screenNote}>House of Bollywood presents</span>
          <span className={styles.scratches} />
        </div>

        <div data-reel className={styles.reel}>
          <div data-strip className={styles.strip}>
            {REEL.map((product, index) => (
              <Link key={product.id} data-frame href={`/product/${product.slug}`} className={styles.frame} aria-label={`${product.name}, ${formatInrFromPaise(product.pricePaise)}`}>
                <span className={styles.framePhoto}>
                  <Image src={product.gallery[0]} alt="" fill sizes="(min-width: 1024px) 24vw, 46vw" className={styles.photo} />
                </span>
                <span className={styles.edgeCode} aria-hidden="true">HOB {String(index + 1).padStart(2, "0")} ▸ {product.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div data-caption className={styles.caption} aria-hidden="true">
          <p className={styles.eyebrow}>Now showing · <span data-caption-index>01</span>/{String(REEL.length).padStart(2, "0")}</p>
          <p className={styles.captionLine}>
            <span data-caption-name className={styles.captionName}>{REEL[0].name}</span>
            <span data-caption-price className={styles.captionPrice}>{formatInrFromPaise(REEL[0].pricePaise)}</span>
          </p>
        </div>

        <div data-flash className={styles.flash} aria-hidden="true" />

        <div data-curtain="left" className={`${styles.curtain} ${styles.curtainLeft}`} aria-hidden="true"><span className={styles.fabric} /></div>
        <div data-curtain="right" className={`${styles.curtain} ${styles.curtainRight}`} aria-hidden="true"><span className={styles.fabric} /></div>
        <div data-valance className={styles.valance} aria-hidden="true" />

        <div data-spotlights className={styles.spotlights} aria-hidden="true">
          <span className={styles.spotLeft} />
          <span className={styles.spotRight} />
          <span className={styles.cursorLight} />
        </div>

        <div data-sign className={styles.sign} aria-hidden="true">
          <div className={styles.marquee}>
            <Bulbs />
            <p className={styles.signKicker}>Tonight · World premiere</p>
            <p className={styles.signTitle}>
              <span className={styles.signHouse}>House of</span>
              <span className={styles.signWood}>Bollywood</span>
            </p>
            <p className={styles.signStarring}>Starring <strong>main character energy</strong></p>
          </div>
          <p data-cue className={styles.cue}>Scroll to raise the curtain <ArrowDown size={14} /></p>
        </div>

        <div data-finale className={styles.finale}>
          <Confetti />
          <p className={styles.eyebrow}>Directed by House of Bollywood</p>
          <p className={styles.finaleTitle}>Starring<br /><span>You.</span></p>
          <Link href="/shop" className={styles.ticket}>
            <span className={styles.ticketStub}>Admit<br />one</span>
            <span className={styles.ticketBody}><small>Row H · Seat 01 · Tonight</small>Shop the fit</span>
            <ArrowUpRight size={18} aria-hidden="true" className={styles.ticketArrow} />
          </Link>
        </div>

        <div className={styles.audience} aria-hidden="true" />
        <div className={styles.grain} aria-hidden="true" />

        <div className={styles.bottomline}>
          <div className={styles.scene} aria-hidden="true">
            <span data-scene-number className={styles.sceneNumber}>01</span>
            <span data-scene-label>{SCENES[0]}</span>
            <ArrowDown size={15} />
          </div>
          <div className={styles.actions}>
            <a href="#categories" className={styles.skip}>Skip ahead <ArrowDown size={13} aria-hidden="true" /></a>
            <Link href="/shop" className={styles.shop}>Shop the fit <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className={styles.progressTrack} aria-hidden="true"><div data-progress className={styles.progress} /></div>
      </div>
    </section>
  );
}
