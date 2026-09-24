import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProducts,
  getProductBySlug,
  getProductSlugs,
} from "@/features/catalog/data";
import { ProductDetail } from "@/features/product/components/product-detail";
import { ProductCard } from "@/components/shared/product-card";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: "Product | House of Bollywood" };
  }
  return {
    title: `${product.name} | House of Bollywood`,
    description: product.summary,
    robots: { index: false, follow: false },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getAllProducts()
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  return (
    <main className="flex flex-1 flex-col bg-background">
      <ProductDetail product={product} />
      <section className="border-t border-border px-4 py-14 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            More tees
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
