import type { Metadata } from "next";
import { requireAdmin } from "@/features/admin/auth/dal";
import { toDiscountFormValues } from "@/features/admin/data/discounts";
import { getProductCategories } from "@/features/admin/data/products";
import { DiscountForm } from "@/features/admin/components/discounts/discount-form";

export const metadata: Metadata = { title: "New discount" };

export default async function NewDiscountPage() {
  await requireAdmin();
  const categories = getProductCategories().map(({ id, name }) => ({ id, name }));

  return (
    <div className="mx-auto w-full max-w-[1200px] -mt-6 sm:-mt-8 lg:-mt-10">
      <DiscountForm initial={toDiscountFormValues()} categories={categories} />
    </div>
  );
}
