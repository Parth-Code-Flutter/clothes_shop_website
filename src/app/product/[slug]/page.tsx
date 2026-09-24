import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProducts,
  getProductBySlug,
  getProductSlugs,
} from "@/features/catalog/data";
import { ProductDetail } from "@/features/product/components/product-detail";
import { RelatedProducts } from "@/features/product/components/related-products";

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
      <ProductDetail key={product.id} product={product} />
      <RelatedProducts products={related} />
    </main>
  );
}
