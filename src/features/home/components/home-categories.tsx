import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllCategories, getProductsByCategory } from "@/features/catalog/data";
import styles from "./home-cinema.module.css";

/** Category wall styled as a row of film posters, one feature per wardrobe chapter. */
export function HomeCategories() {
  const categories = getAllCategories();

  return (
    <section id="categories" className="overflow-hidden bg-background text-foreground">
      <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 sm:py-24 lg:px-10 lg:py-32 xl:px-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)] lg:items-end">
          <div>
            <p className="text-[10px] font-bold tracking-[0.32em] text-accent uppercase">Scene 02 · Now showing</p>
            <h2 className="mt-4 max-w-4xl font-display text-[clamp(4rem,9vw,9rem)] leading-[0.8] tracking-[-0.03em]">
              Choose<br />your scene.
            </h2>
          </div>
          <div className="max-w-md border-l border-border pl-5 lg:mb-2">
            <p className="text-sm leading-7 text-muted">
              Start with the mood, not the menu. Four wardrobe chapters, arranged for quick browsing and a little discovery.
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
              <Link key={category.id} href={`/shop?category=${category.id}`} aria-label={`Shop ${category.name}, ${count} pieces`} className={`${styles.poster} group relative isolate row-span-2 overflow-hidden bg-footer text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:col-span-6 lg:col-span-3`}>
                <Image src={category.image} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/45" aria-hidden="true" />
                <span className={styles.posterFrame} aria-hidden="true" />
                <span className={styles.sheen} aria-hidden="true" />
                {index === 0 ? <span className={styles.ribbon}>Now showing</span> : null}
                <span className={`${styles.presents} absolute inset-x-0 top-7 z-[3] text-center`}>House of Bollywood presents</span>
                <span className="absolute inset-x-0 bottom-0 z-[3] flex flex-col p-7 sm:p-8">
                  <span className={styles.posterScene}>Feature {String(index + 1).padStart(2, "0")}</span>
                  <span className={`${styles.posterTitle} mt-2 block font-display text-5xl leading-[0.9] tracking-wide sm:text-6xl`}>{category.name}</span>
                  <span className="mt-3 line-clamp-2 max-w-xs text-xs leading-5 text-white/70">{category.description}</span>
                  <span className={`${styles.billing} mt-4`}>
                    Starring <strong>{count} pieces</strong> · Directed by <strong>House of Bollywood</strong> · Rated U/A for unstoppable attitude
                  </span>
                  <span className={`${styles.posterCta} mt-5 self-start`}>
                    Shop the scene <ArrowUpRight size={14} aria-hidden="true" />
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
