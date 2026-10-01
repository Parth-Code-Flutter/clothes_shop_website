import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/admin/auth/dal";
import { LOW_STOCK_THRESHOLD, getAdminProduct, getProductCategories, toProductFormValues } from "@/features/admin/data/products";
import { ProductForm } from "@/features/admin/components/products/product-form";

export async function generateMetadata({ params }: PageProps<"/admin/products/[id]">): Promise<Metadata> {
  const product = getAdminProduct((await params).id);
  return { title: product ? `Edit ${product.name}` : "Product not found" };
}

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const product = getAdminProduct((await params).id);
  if (!product) notFound();

  return (
    <div className="mx-auto w-full max-w-[1200px] -mt-6 sm:-mt-8 lg:-mt-10">
      <ProductForm initial={toProductFormValues(product)} categories={getProductCategories()} threshold={LOW_STOCK_THRESHOLD} />
    </div>
  );
}
