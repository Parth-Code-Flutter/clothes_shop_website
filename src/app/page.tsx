import { HomeChapterNav } from "@/features/home/components/home-chapter-nav";
import { HomeDropStage } from "@/features/home/components/home-drop-stage";
import { HomeFinale } from "@/features/home/components/home-finale";
import { HomeHero } from "@/features/home/components/home-hero";
import { HomeLook } from "@/features/home/components/home-look";
import { HomeMedia } from "@/features/home/components/home-media";

/**
 * Homepage only — Rockstar VI–style scroll story.
 * Uses existing House of Bollywood campaign + product images.
 */
export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col bg-[#05070f] text-white">
      <HomeChapterNav />
      <HomeHero />
      <HomeLook />
      <HomeDropStage />
      <HomeMedia />
      <HomeFinale />
    </main>
  );
}
