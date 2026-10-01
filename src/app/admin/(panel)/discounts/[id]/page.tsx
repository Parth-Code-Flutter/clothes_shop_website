import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/admin/auth/dal";
import { getDiscount, toDiscountFormValues } from "@/features/admin/data/discounts";
import { getProductCategories } from "@/features/admin/data/products";
import { DiscountForm } from "@/features/admin/components/discounts/discount-form";
import { formatDate } from "@/features/admin/lib/format";

export async function generateMetadata({ params }: PageProps<"/admin/discounts/[id]">): Promise<Metadata> {
  const discount = getDiscount((await params).id);
  return { title: discount ? `Edit ${discount.code}` : "Discount not found" };
}

export default async function EditDiscountPage({ params }: PageProps<"/admin/discounts/[id]">) {
  await requireAdmin();
  const discount = getDiscount((await params).id);
  if (!discount) notFound();
  const categories = getProductCategories().map(({ id, name }) => ({ id, name }));

  return (
    <div className="mx-auto w-full max-w-[1200px] -mt-6 sm:-mt-8 lg:-mt-10">
      <DiscountForm
        initial={toDiscountFormValues(discount)}
        categories={categories}
        performance={{
          status: discount.status,
          uses: discount.uses,
          revenuePaise: discount.revenuePaise,
          discountGivenPaise: discount.discountGivenPaise,
          createdLabel: formatDate(discount.createdAt),
        }}
      />
    </div>
  );
}
