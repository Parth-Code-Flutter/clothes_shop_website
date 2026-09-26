import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/features/catalog/data";

/** Category tiles that open the shop, in the style of a fashion edit. */
export function HomeCategories() {
  const categories = getAllCategories();

  return (
    <section id="categories" className="bg-background px-4 py-20 text-foreground sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.32em] text-gold uppercase">
              Categories
            </p>
            <h2 className="mt-3 font-display text-5xl tracking-tight sm:text-6xl">
              Dress the day.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted">
            Five shelves. Shirts through jackets. Open any one.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
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
                  sizes="(max-width: 1024px) 50vw, 20vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
                />
              </span>
              <span className="mt-3 block text-sm font-medium tracking-wide">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
