import type { Metadata } from "next";
import { requireAdmin } from "@/features/admin/auth/dal";
import { getCollections } from "@/features/admin/data/collections";
import { getSiteContent } from "@/features/admin/data/content";
import { SiteContentForm } from "@/features/admin/components/content/site-content-form";

export const metadata: Metadata = { title: "Homepage & site copy" };

export default async function HomepageContentPage() {
  await requireAdmin();
  const collections = getCollections()
    .filter((collection) => collection.products.length > 0)
    .map((collection) => ({ id: collection.id, title: collection.title, count: collection.products.length }));

  return (
    <div className="mx-auto w-full max-w-[1200px] -mt-6 sm:-mt-8 lg:-mt-10">
      <SiteContentForm initial={getSiteContent()} collections={collections} />
    </div>
  );
}
