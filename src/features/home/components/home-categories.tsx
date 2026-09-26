import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllCategories, getProductsByCategory } from "@/features/catalog/data";
import { cn } from "@/lib/utils";

const tileStyles = [
  "md:col-span-7 md:row-span-2",
  "md:col-span-5",
  "md:col-span-5",
  "md:col-span-4",
  "md:col-span-8",
] as const;

/** Editorial category wall: discovery first, without making the customer decode it. */
export function HomeCategories() {
  const categories = getAllCategories();

  return (
    <section id="categories" className="overflow-hidden bg-background text-foreground">
      <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 sm:py-24 lg:px-10 lg:py-32 xl:px-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)] lg:items-end">
          <div>
            <p className="text-[10px] font-bold tracking-[0.32em] text-accent uppercase">Pick your character</p>
            <h2 className="mt-4 max-w-4xl font-display text-[clamp(4rem,9vw,9rem)] leading-[0.8] tracking-[-0.03em]">
              Choose<br />your scene.
            </h2>
          </div>
          <div className="max-w-md border-l border-border pl-5 lg:mb-2">
            <p className="text-sm leading-7 text-muted">
              Start with the mood, not the menu. Five wardrobe chapters, arranged for quick browsing and a little discovery.
            </p>
            <Link href="/shop" className="mt-6 inline-flex min-h-11 items-center gap-3 text-xs font-bold tracking-[0.16em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              Enter the wardrobe <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-14 grid auto-rows-[280px] gap-3 md:grid-cols-12 md:auto-rows-[250px] lg:mt-20 lg:auto-rows-[300px]">
          {categories.map((category, index) => {
            const count = getProductsByCategory(category.id).length;
            return (
              <Link key={category.id} href={`/shop?category=${category.id}`} className={cn("group relative isolate overflow-hidden bg-footer text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent", tileStyles[index])}>
                <Image src={category.image} alt="" fill sizes={index === 0 ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 45vw"} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/10" aria-hidden="true" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                  <span>
                    <span className="block text-[9px] font-bold tracking-[0.25em] text-white/65 uppercase">Scene {String(index + 1).padStart(2, "0")} · {count} pieces</span>
                    <span className="mt-2 block font-display text-4xl leading-none tracking-wide sm:text-5xl">{category.name}</span>
                  </span>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/45 bg-black/10 backdrop-blur-sm transition-all duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-black motion-reduce:transition-none">
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
