import type { Metadata } from "next";
import { headers } from "next/headers";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/features/admin/auth/dal";
import { toPageFormValues } from "@/features/admin/data/content";
import { PageForm } from "@/features/admin/components/content/page-form";

export const metadata: Metadata = { title: "New page" };

export default async function NewContentPage() {
  await requireAdmin();
  const host = (await headers()).get("host") ?? "your-store.com";

  return (
    <div className="mx-auto w-full max-w-[1200px] -mt-6 sm:-mt-8 lg:-mt-10">
      <PageForm initial={toPageFormValues()} storeName={siteConfig.name} host={host} />
    </div>
  );
}
