import type { Metadata } from "next";
import { requireAdmin } from "@/features/admin/auth/dal";
import { LOW_STOCK_THRESHOLD, getProductCategories, toProductFormValues } from "@/features/admin/data/products";
import { ProductForm } from "@/features/admin/components/products/product-form";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div className="mx-auto w-full max-w-[1200px] -mt-6 sm:-mt-8 lg:-mt-10">
      <ProductForm initial={toProductFormValues()} categories={getProductCategories()} threshold={LOW_STOCK_THRESHOLD} />
    </div>
  );
}
