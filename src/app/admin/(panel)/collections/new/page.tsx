import type { Metadata } from "next";
import { requireAdmin } from "@/features/admin/auth/dal";
import { getRuleProducts, toCollectionFormValues } from "@/features/admin/data/collections";
import { getProductCategories } from "@/features/admin/data/products";
import { CollectionForm } from "@/features/admin/components/collections/collection-form";

export const metadata: Metadata = { title: "New collection" };

export default async function NewCollectionPage() {
  await requireAdmin();
  const products = getRuleProducts();

  return (
    <div className="mx-auto w-full max-w-[1200px] -mt-6 sm:-mt-8 lg:-mt-10">
      <CollectionForm
        initial={toCollectionFormValues()}
        categories={getProductCategories().map(({ id, name }) => ({ id, name }))}
        products={products}
        colors={[...new Set(products.map((product) => product.color))].sort()}
      />
    </div>
  );
}
