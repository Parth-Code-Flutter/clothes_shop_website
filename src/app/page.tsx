import { HomeChapterNav } from "@/features/home/components/home-chapter-nav";
import { HomeDropStage } from "@/features/home/components/home-drop-stage";
import { HomeFinale } from "@/features/home/components/home-finale";
import { HomeHero } from "@/features/home/components/home-hero";
import { HomeLook } from "@/features/home/components/home-look";
import { HomeMedia } from "@/features/home/components/home-media";

/**
 * Homepage — cinematic scroll story that respects light/dark theme tokens.
 * Photo panels keep light type on dark scrims for contrast on imagery.
 */
export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col bg-background text-foreground">
      <HomeChapterNav />
      <HomeHero />
      <HomeLook />
      <HomeDropStage />
      <HomeMedia />
      <HomeFinale />
    </main>
  );
}
