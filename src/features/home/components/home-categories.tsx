import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/features/catalog/data";

/** Category shortcuts into the shop — compact tiles, easy to tap. */
export function HomeCategories() {
  const categories = getAllCategories();

  return (
    <section id="categories" className="bg-background py-10 text-foreground sm:py-12 lg:pr-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">
              Shop by
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Categories</h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex min-h-10 items-center text-[13px] font-semibold text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Shop all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.id}`}
              className="group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              <span className="relative block aspect-[3/4] overflow-hidden bg-[#f3f0eb] dark:bg-footer">
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              </span>
              <span className="mt-2 block text-[13px] font-bold tracking-tight">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
