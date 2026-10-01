import { getAdminSession } from "@/features/admin/auth/dal";
import { filterOrders, parseOrderQuery } from "@/features/admin/data/orders";
import { ORDER_STATUS_META } from "@/features/admin/lib/order-status";

/** Downloads the orders matching the list's current tab, search and filters. */
export async function GET(request: Request) {
  if (!(await getAdminSession())) return new Response("Unauthorized", { status: 401 });

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const { orders } = filterOrders(parseOrderQuery(params));

  const header = ["Order", "Placed at", "Status", "Customer", "Email", "Phone", "City", "State", "Pincode", "Items", "Subtotal", "Discount", "Shipping", "Total", "Payment", "Payment status", "Courier", "AWB"];
  const rupees = (paise: number) => (paise / 100).toFixed(2);
  const lines = orders.map((order) => [
    order.number,
    order.placedAt,
    ORDER_STATUS_META[order.status].label,
    order.customer.name,
    order.customer.email,
    order.customer.phone,
    order.shipping.city,
    order.shipping.state,
    order.shipping.pincode,
    order.items.map((item) => `${item.quantity} x ${item.name} (${item.size})`).join("; "),
    rupees(order.subtotalPaise),
    rupees(order.discountPaise),
    rupees(order.shippingPaise),
    rupees(order.totalPaise),
    order.payment.method,
    order.payment.status,
    order.tracking?.courier ?? "",
    order.tracking?.awb ?? "",
  ]);

  // Quote every cell, and defuse values a spreadsheet would run as a formula (phone numbers are safe).
  const formulaLike = (value: string) => /^[=+\-@\t\r]/.test(value) && !/^\+?[\d\s-]+$/.test(value);
  const cell = (value: string) => `"${(formulaLike(value) ? `'${value}` : value).replace(/"/g, '""')}"`;
  const csv = [header, ...lines].map((line) => line.map(cell).join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
