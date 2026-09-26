import { HomeArrivals } from "@/features/home/components/home-arrivals";
import { HomeCategories } from "@/features/home/components/home-categories";
import { HomeChapterNav } from "@/features/home/components/home-chapter-nav";
import { HomeHero } from "@/features/home/components/home-hero";

/**
 * Homepage — cinematic scroll story that respects light/dark theme tokens.
 * Photo panels keep light type on dark scrims for contrast on imagery.
 */
export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col bg-background text-foreground">
      <HomeChapterNav />
      <HomeHero />
      <HomeCategories />
      <HomeArrivals />
    </main>
  );
}
