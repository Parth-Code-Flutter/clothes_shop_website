import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/admin/auth/dal";
import { getCollection, getRuleProducts, toCollectionFormValues } from "@/features/admin/data/collections";
import { getProductCategories } from "@/features/admin/data/products";
import { CollectionForm } from "@/features/admin/components/collections/collection-form";

export async function generateMetadata({ params }: PageProps<"/admin/collections/[id]">): Promise<Metadata> {
  const collection = getCollection((await params).id);
  return { title: collection ? `Edit ${collection.title}` : "Collection not found" };
}

export default async function EditCollectionPage({ params }: PageProps<"/admin/collections/[id]">) {
  await requireAdmin();
  const collection = getCollection((await params).id);
  if (!collection) notFound();
  const products = getRuleProducts();

  return (
    <div className="mx-auto w-full max-w-[1200px] -mt-6 sm:-mt-8 lg:-mt-10">
      <CollectionForm
        initial={toCollectionFormValues(collection)}
        categories={getProductCategories().map(({ id, name }) => ({ id, name }))}
        products={products}
        colors={[...new Set(products.map((product) => product.color))].sort()}
      />
    </div>
  );
}
