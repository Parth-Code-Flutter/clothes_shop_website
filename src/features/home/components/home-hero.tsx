"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { jacketHeroMedia } from "@/features/home/jacket-hero-media";
import styles from "./home-hero.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Three matched photographic poses make a scroll-controlled editorial turn. */
export function HomeHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const element = root.current;
    if (!element) return;
    const media = gsap.matchMedia();
    media.add(
      {
        desktop: "(min-width: 1024px)",
        mobile: "(max-width: 1023px)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { desktop, reduced } = context.conditions!;
        if (reduced) return;
        const select = gsap.utils.selector(element);
        const figure = select("[data-figure]");
        const front = select("[data-front]");
        const side = select("[data-side]");
        const back = select("[data-back]");
        const intro = select("[data-intro]");
        const rearCopy = select("[data-rear-copy]");
        const ending = select("[data-ending]");
        const progress = select("[data-progress]");
        const chrome = select("[data-chrome]");
        const stamp = element.querySelector<HTMLElement>("[data-jacket-print]")!;
        const anchor = element.querySelector<HTMLElement>("[data-figure-anchor]")!;
        const stage = element.querySelector<HTMLElement>("[data-hero-stage]")!;
        const label = element.querySelector<HTMLElement>("[data-scene-label]");
        const number = element.querySelector<HTMLElement>("[data-scene-number]");
        let currentScene = -1;

        // Offset geometry is unaffected by transforms. Re-evaluate on refresh so
        // the camera always lands on the lettering after a viewport/font change.
        const stampCenter = () => stamp.offsetTop + stamp.offsetHeight / 2;
        const cameraOrigin = () => `50% ${stampCenter()}px`;
        const cameraY = () => stage.clientHeight * 0.47 - anchor.offsetTop - stampCenter();
        const initialX = () => desktop ? element.clientWidth * 0.17 : 0;

        gsap.set(front, { autoAlpha: 1, rotationY: 0, xPercent: 0 });
        gsap.set(side, { autoAlpha: 0, rotationY: -18, xPercent: 0 });
        gsap.set(back, { autoAlpha: 0, rotationY: -28, xPercent: 0 });
        gsap.set([rearCopy, ending], { autoAlpha: 0 });
        gsap.set(progress, { scaleX: 0 });

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: element,
            start: () => `top top+=${desktop ? 88 : 72}`,
            end: "bottom bottom",
            scrub: 0.45,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const scene = self.progress < 0.42 ? 0 : self.progress < 0.68 ? 1 : 2;
              if (scene === currentScene) return;
              currentScene = scene;
              if (label) label.textContent = [
                "Scroll to turn", "Peep the back", "House of Bollywood",
              ][scene];
              if (number) number.textContent = `0${scene + 1}`;
            },
          },
        });

        timeline
          .fromTo(figure, { x: initialX, y: 0, scale: 1 },
            { x: 0, duration: 0.23, ease: "power1.inOut" }, 0.1)
          .to(intro, { autoAlpha: 0, y: -30, duration: 0.14 }, 0.06)
          .to(front, { rotationY: 36, duration: 0.16, ease: "power1.in" }, 0.19)
          .to(side, { autoAlpha: 1, duration: 0.07 }, 0.26)
          .to(front, { autoAlpha: 0, duration: 0.07 }, 0.27)
          .to(side, { rotationY: 18, duration: 0.19 }, 0.27)
          .to(back, { autoAlpha: 1, duration: 0.08 }, 0.41)
          .to(side, { autoAlpha: 0, duration: 0.08 }, 0.42)
          .to(back, { rotationY: 0, duration: 0.15, ease: "power1.out" }, 0.42)
          .to(rearCopy, { autoAlpha: 1, duration: 0.08 }, 0.48)
          .to(rearCopy, { autoAlpha: 0, duration: 0.06 }, 0.56)
          .set(figure, { transformOrigin: cameraOrigin }, 0.6)
          .to(figure, {
            scale: desktop ? 5.5 : 4.5,
            y: cameraY,
            duration: 0.16,
            ease: "power2.inOut",
          }, 0.6)
          .to(chrome, { autoAlpha: 0, duration: 0.06 }, 0.72)
          .to(figure, { autoAlpha: 0, duration: 0.08 }, 0.74)
          .to(ending, { autoAlpha: 1, duration: 0.1 }, 0.74)
          .to(progress, { scaleX: 1, duration: 1 }, 0);

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

  return (
    <section ref={root} id="opener" className={styles.hero} aria-label="House of Bollywood jacket story">
      <h1 className={styles.accessibleTitle}>House of Bollywood. Main character energy.</h1>
      <div
        data-hero-stage
        className={styles.stage}
        tabIndex={0}
        aria-label="Jacket story. Scroll or use arrow keys to turn the model."
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          const story = root.current;
          if (!story) return;
          event.preventDefault();
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          const step = story.offsetHeight * 0.22 * (event.key === "ArrowDown" ? 1 : -1);
          window.scrollBy({ top: step, behavior: reduce ? "auto" : "smooth" });
        }}
      >
        <div className={styles.grain} aria-hidden="true" />
        <div data-chrome className={styles.topline}>
          <span><span className={styles.liveDot} /> House of Bollywood</span>
          <span className={styles.edition}>Main character, daily</span>
        </div>

        <div data-intro className={styles.intro} aria-hidden="true">
          <p className={styles.eyebrow}>No basic fits</p>
          <p className={styles.title}>MAIN<br /><span>CHARACTER</span><br />ENERGY.</p>
          <p className={styles.description}>Scroll. The fit turns with you.</p>
        </div>

        <div data-chrome className={styles.outlineWord} aria-hidden="true">ENERGY</div>
        <div data-figure-anchor className={styles.figureAnchor} role="img" aria-label="A model in a black jacket turns from front to side to back, revealing House of Bollywood on the jacket.">
          <div data-figure className={styles.figure}>
            <div data-front className={`${styles.pose} ${styles.front}`}>
              <Image src={jacketHeroMedia.front} alt="" fill loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 55vw, 100vw" className={styles.portrait} />
            </div>
            <div data-side className={`${styles.pose} ${styles.side}`}>
              <Image src={jacketHeroMedia.side} alt="" fill loading="eager" sizes="(min-width: 1024px) 55vw, 100vw" className={styles.portrait} />
            </div>
            <div data-back className={`${styles.pose} ${styles.back}`}>
              <Image src={jacketHeroMedia.back} alt="" fill loading="eager" sizes="(min-width: 1024px) 55vw, 100vw" className={styles.portrait} />
              <div data-jacket-print className={styles.jacketPrint} aria-hidden="true">
                <span className={styles.printHouse}>House of</span>
                <span className={styles.printWood}>Bollywood</span>
              </div>
            </div>
          </div>
        </div>

        <div data-rear-copy className={styles.rearCopy} aria-hidden="true">
          <p className={styles.eyebrow}>Plot twist</p>
          <p>THE BACK<br /><span>HITS DIFFERENT.</span></p>
        </div>
        <div data-ending className={styles.ending} aria-hidden="true">
          <span>You made it</span>
          <p>
            <span className={styles.endingHouse}>House of</span>
            <span className={styles.endingWood}>Bollywood</span>
          </p>
          <ArrowDown size={22} />
        </div>

        <div className={styles.bottomline}>
          <div className={styles.scene} aria-hidden="true">
            <span data-scene-number className={styles.sceneNumber}>01</span>
            <span data-scene-label>Scroll to turn</span><ArrowDown size={15} />
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
