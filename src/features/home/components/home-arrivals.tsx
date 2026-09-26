import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ProductCard, productGridClass } from "@/components/shared/product-card";
import { getAllProducts, getCategoryById } from "@/features/catalog/data";
import { formatInrFromPaise } from "@/lib/money";

/** Product chapter with one memorable lead piece and a low-friction browse grid. */
export function HomeArrivals() {
  const products = getAllProducts();
  const lead = products[0];
  const supporting = products.slice(1, 9);
  const category = getCategoryById(lead.categoryId);

  return (
    <section id="arrivals" className="overflow-hidden bg-[#15110f] text-[#f7f2ea]">
      <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 sm:py-24 lg:px-10 lg:py-32 xl:px-14">
        <div className="flex flex-col gap-8 border-b border-white/15 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.32em] text-[#fa5d50] uppercase">The new edit</p>
            <h2 className="mt-4 font-display text-[clamp(3.8rem,8vw,8rem)] leading-[0.82] tracking-[-0.025em]">Fresh on set.</h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/55 sm:text-right">
            The latest pieces, directed for real wardrobes. Start with the lead look or scan the full cast below.
          </p>
        </div>

        <article className="mt-10 grid overflow-hidden border border-white/15 lg:grid-cols-12">
          <Link href={`/product/${lead.slug}`} className="group relative min-h-[520px] overflow-hidden bg-[#e9dfd1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fa5d50] sm:min-h-[680px] lg:col-span-7" aria-label={`View ${lead.name}`}>
            <Image src={lead.image} alt={lead.alt} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
            <span className="absolute top-5 left-5 border border-black/15 bg-white/90 px-3 py-2 text-[9px] font-bold tracking-[0.22em] text-black uppercase backdrop-blur sm:top-7 sm:left-7">Opening look</span>
          </Link>

          <div className="flex flex-col justify-between bg-[#f3ede4] p-6 text-[#171310] sm:p-10 lg:col-span-5 lg:p-12">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] text-[#73675e] uppercase">01 / {category?.name ?? "New arrival"}</p>
              <h3 className="mt-6 max-w-lg font-display text-6xl leading-[0.88] tracking-wide sm:text-7xl lg:text-[6.5rem]">{lead.name}</h3>
              <p className="mt-7 max-w-md text-sm leading-7 text-[#5d534c]">{lead.summary}</p>
            </div>
            <div className="mt-14 border-t border-black/15 pt-6">
              <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
                <p className="font-display text-4xl tracking-wide">{formatInrFromPaise(lead.pricePaise)}</p>
                <Link href={`/product/${lead.slug}`} className="inline-flex min-h-12 items-center gap-3 bg-[#171310] px-5 text-xs font-bold tracking-[0.14em] text-white uppercase transition-colors hover:bg-[#ea1916] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ea1916]">
                  View the piece <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </article>

        <div className="mt-20 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.28em] text-white/45 uppercase">Supporting cast</p>
            <h3 className="mt-2 font-display text-4xl tracking-wide sm:text-5xl">More entrances.</h3>
          </div>
          <Link href="/shop" className="inline-flex min-h-11 items-center gap-3 self-start text-xs font-bold tracking-[0.14em] uppercase hover:text-[#fa5d50] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fa5d50] sm:self-auto">
            See the whole wardrobe <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 bg-background p-3 text-foreground sm:p-5 lg:p-7">
          <div className={productGridClass}>
            {supporting.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>

        <div className="mt-16 grid gap-px border border-white/15 bg-white/15 sm:grid-cols-3">
          {[
            ["01", "Find your lane", "Browse by category without losing your place."],
            ["02", "Save the ones", "Build a wishlist before you make the call."],
            ["03", "Try the full look", "Open a piece for size, details, and the next move."],
          ].map(([number, title, copy]) => (
            <div key={number} className="bg-[#15110f] p-6 sm:p-8">
              <span className="font-mono text-[10px] text-[#fa5d50]">{number}</span>
              <p className="mt-8 font-display text-3xl tracking-wide">{title}</p>
              <p className="mt-2 text-xs leading-6 text-white/50">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
