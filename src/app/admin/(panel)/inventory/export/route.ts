import { getAdminSession } from "@/features/admin/auth/dal";
import { filterInventory, parseInventoryQuery } from "@/features/admin/data/inventory";
import { LOW_STOCK_THRESHOLD } from "@/features/admin/data/products";

/** A restock list for the supplier: every low or sold-out size in the current view, one row per size. */
export async function GET(request: Request) {
  if (!(await getAdminSession())) return new Response("Unauthorized", { status: 401 });

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const { items } = filterInventory(parseInventoryQuery(params));

  const header = ["SKU", "Product", "Category", "Size", "In stock", "Sold last 7 days", "Status"];
  const lines = items.flatMap((item) =>
    item.sizes
      .filter((size) => (item.stock[size] ?? 0) <= LOW_STOCK_THRESHOLD)
      .map((size) => {
        const left = item.stock[size] ?? 0;
        return [item.sku, item.name, item.categoryName, size, String(left), String(item.sold7d[size] ?? 0), left === 0 ? "Sold out" : "Low"];
      }),
  );

  const formulaLike = (value: string) => /^[=+\-@\t\r]/.test(value);
  const cell = (value: string) => `"${(formulaLike(value) ? `'${value}` : value).replace(/"/g, '""')}"`;
  const csv = [header, ...lines].map((line) => line.map(cell).join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="restock-list-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
