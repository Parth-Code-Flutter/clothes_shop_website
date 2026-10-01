import { redirect } from "next/navigation";
import { parseRange } from "@/features/admin/data/analytics";

/** Analytics now lives on the dashboard; keep old bookmarks working. */
export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  const days = parseRange((await searchParams).range);
  redirect(days === 30 ? "/admin#sales" : `/admin?range=${days}#sales`);
}
