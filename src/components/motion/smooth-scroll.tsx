"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, type LenisRef } from "lenis/react";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

type SmoothScrollApi = {
  stop: () => void;
  start: () => void;
};

const SmoothScrollContext = createContext<SmoothScrollApi>({
  stop: () => undefined,
  start: () => undefined,
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<LenisRef>(null);
  const [allowSmooth, setAllowSmooth] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowSmooth(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!allowSmooth) return;

    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    const lenis = lenisRef.current?.lenis;
    const onScroll = () => ScrollTrigger.update();
    if (lenis) {
      lenis.on("scroll", onScroll);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(update);
      lenis?.off("scroll", onScroll);
    };
  }, [allowSmooth, pathname]);

  useEffect(() => {
    if (!allowSmooth) return;
    lenisRef.current?.lenis?.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
  }, [pathname, allowSmooth]);

  const stop = useCallback(() => {
    lenisRef.current?.lenis?.stop();
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.lenis?.start();
  }, []);

  const api = useMemo(() => ({ stop, start }), [stop, start]);

  if (!allowSmooth) {
    return (
      <SmoothScrollContext.Provider value={api}>
        {children}
      </SmoothScrollContext.Provider>
    );
  }

  return (
    <SmoothScrollContext.Provider value={api}>
      <ReactLenis
        root
        ref={lenisRef}
        options={{
          autoRaf: false,
          anchors: true,
          stopInertiaOnNavigate: true,
          lerp: 0.08,
          duration: 1.15,
          touchMultiplier: 1.4,
        }}
      >
        {children}
      </ReactLenis>
    </SmoothScrollContext.Provider>
  );
}
