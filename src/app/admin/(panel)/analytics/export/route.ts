import { getAdminSession } from "@/features/admin/auth/dal";
import { getAnalytics, parseRange } from "@/features/admin/data/analytics";

/** Daily sales for the selected range, one row per day, for spreadsheets or the accountant. */
export async function GET(request: Request) {
  if (!(await getAdminSession())) return new Response("Unauthorized", { status: 401 });

  const days = parseRange(new URL(request.url).searchParams.get("range") ?? undefined);
  const { series } = getAnalytics(days);

  const header = ["Date", "Revenue (INR)", "Orders", "Average order value (INR)", "Store visits", "Conversion rate (%)", "New customers"];
  const lines = series.slice(-days).map((day) => [
    day.iso,
    (day.revenuePaise / 100).toFixed(2),
    String(day.orders),
    day.orders ? (day.revenuePaise / day.orders / 100).toFixed(2) : "0.00",
    String(day.sessions),
    day.sessions ? ((day.orders / day.sessions) * 100).toFixed(2) : "0.00",
    String(day.newCustomers),
  ]);

  const csv = [header, ...lines].map((line) => line.map((value) => `"${value.replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sales-${days}-days-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
