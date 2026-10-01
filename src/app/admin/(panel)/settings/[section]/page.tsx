import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/admin/auth/dal";
import { getSettings } from "@/features/admin/data/settings";
import { SettingsEditor } from "@/features/admin/components/settings/settings-sections";
import { SETTINGS_META, isSettingsSection } from "@/features/admin/lib/settings-meta";

export async function generateMetadata({ params }: PageProps<"/admin/settings/[section]">): Promise<Metadata> {
  const { section } = await params;
  return { title: isSettingsSection(section) ? SETTINGS_META[section].label : "Settings" };
}

export default async function SettingsSectionPage({ params }: PageProps<"/admin/settings/[section]">) {
  const session = await requireAdmin();
  const { section } = await params;
  if (!isSettingsSection(section)) notFound();

  return (
    <div className="mx-auto w-full max-w-[1200px] -mt-6 sm:-mt-8 lg:-mt-10">
      <SettingsEditor section={section} settings={getSettings(session)} />
    </div>
  );
}
