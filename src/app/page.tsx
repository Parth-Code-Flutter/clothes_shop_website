import { HomeDropStage, HomeMarquee } from "@/features/home/components/home-drop-stage";
import { HomeHero } from "@/features/home/components/home-hero";
import { HomeLook } from "@/features/home/components/home-look";
import { HomeNewsletter } from "@/features/home/components/home-newsletter";
import { HomeProducts } from "@/features/home/components/home-products";
import { HomeServices } from "@/features/home/components/home-services";
import { HomeSpotlight } from "@/features/home/components/home-spotlight";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <HomeHero />
      <HomeMarquee />
      <HomeSpotlight />
      <HomeDropStage />
      <HomeLook />
      <HomeProducts />
      <HomeServices />
      <HomeNewsletter />
    </main>
  );
}
