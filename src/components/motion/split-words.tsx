"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type SplitWordsProps = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  immediate?: boolean;
};

/**
 * Free GSAP word-split reveal (no Club SplitText plugin).
 * Inspired by React Bits SplitText patterns.
 */
export function SplitWords({
  text,
  className = "",
  as: Tag = "p",
  delay = 0.04,
  immediate = false,
}: SplitWordsProps) {
  const ref = useRef<HTMLHeadingElement & HTMLParagraphElement & HTMLSpanElement>(
    null,
  );

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const words = el.querySelectorAll<HTMLElement>(".split-word");
      if (!words.length) return;

      if (reduce) {
        gsap.set(words, { opacity: 1, y: 0, clearProps: "filter" });
        return;
      }

      gsap.fromTo(
        words,
        { opacity: 0, y: 28, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
          stagger: delay,
          ...(immediate
            ? {}
            : {
                scrollTrigger: {
                  trigger: el,
                  start: "top 85%",
                  once: true,
                },
              }),
        },
      );
    },
    { scope: ref, dependencies: [text, delay, immediate] },
  );

  const parts = text.split(/(\s+)/);

  return (
    <Tag ref={ref} className={className}>
      {parts.map((part, index) =>
        /^\s+$/.test(part) ? (
          <span key={`s-${index}`}>{part}</span>
        ) : (
          <span
            key={`w-${index}`}
            className="split-word inline-block will-change-transform"
          >
            {part}
          </span>
        ),
      )}
    </Tag>
  );
}
