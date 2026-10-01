import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/admin/auth/dal";
import { customerIdFor } from "@/features/admin/data/customers";
import { getOrder } from "@/features/admin/data/orders";
import { OrderDetail } from "@/features/admin/components/orders/order-detail";
import { formatDate, formatDateTime } from "@/features/admin/lib/format";

export async function generateMetadata({ params }: PageProps<"/admin/orders/[id]">): Promise<Metadata> {
  const order = getOrder((await params).id);
  return { title: order ? `Order ${order.number}` : "Order not found" };
}

export default async function OrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const order = getOrder((await params).id);
  if (!order) notFound();

  return (
    <OrderDetail
      order={order}
      customerHref={`/admin/customers/${customerIdFor(order.customer.name)}`}
      placedLabel={formatDateTime(order.placedAt)}
      customerSince={formatDate(order.customer.since)}
      events={order.events.map((event) => ({ ...event, atLabel: formatDateTime(event.at) }))}
    />
  );
}
