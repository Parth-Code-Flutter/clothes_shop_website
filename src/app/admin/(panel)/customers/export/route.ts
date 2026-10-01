import { getAdminSession } from "@/features/admin/auth/dal";
import { filterCustomers, parseCustomerQuery } from "@/features/admin/data/customers";

/** Downloads the customers matching the list's current tab, search and sort. */
export async function GET(request: Request) {
  if (!(await getAdminSession())) return new Response("Unauthorized", { status: 401 });

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const { customers } = filterCustomers(parseCustomerQuery(params));

  const header = ["Name", "Email", "Phone", "City", "State", "Pincode", "Segment", "Orders", "Total spent", "Average order", "Last order", "Customer since", "Email marketing", "SMS marketing"];
  const rupees = (paise: number) => (paise / 100).toFixed(2);
  const lines = customers.map((customer) => [
    customer.name,
    customer.email,
    customer.phone,
    customer.address.city,
    customer.address.state,
    customer.address.pincode,
    customer.segment,
    String(customer.ordersCount),
    rupees(customer.totalSpentPaise),
    rupees(customer.avgOrderPaise),
    customer.lastOrderAt,
    customer.since,
    customer.marketing.email ? "yes" : "no",
    customer.marketing.sms ? "yes" : "no",
  ]);

  // Quote every cell, and defuse values a spreadsheet would run as a formula (phone numbers are safe).
  const formulaLike = (value: string) => /^[=+\-@\t\r]/.test(value) && !/^\+?[\d\s-]+$/.test(value);
  const cell = (value: string) => `"${(formulaLike(value) ? `'${value}` : value).replace(/"/g, '""')}"`;
  const csv = [header, ...lines].map((line) => line.map(cell).join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="customers-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
