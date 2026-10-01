import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/features/admin/auth/dal";
import { getPage, toPageFormValues } from "@/features/admin/data/content";
import { PageForm } from "@/features/admin/components/content/page-form";

export async function generateMetadata({ params }: PageProps<"/admin/content/pages/[id]">): Promise<Metadata> {
  const page = getPage((await params).id);
  return { title: page ? `Edit ${page.title}` : "Page not found" };
}

export default async function EditContentPage({ params }: PageProps<"/admin/content/pages/[id]">) {
  await requireAdmin();
  const page = getPage((await params).id);
  if (!page) notFound();
  const host = (await headers()).get("host") ?? "your-store.com";

  return (
    <div className="mx-auto w-full max-w-[1200px] -mt-6 sm:-mt-8 lg:-mt-10">
      <PageForm initial={toPageFormValues(page)} storeName={siteConfig.name} host={host} />
    </div>
  );
}
