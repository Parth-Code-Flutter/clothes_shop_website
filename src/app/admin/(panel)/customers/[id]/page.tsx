import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { requireAdmin } from "@/features/admin/auth/dal";
import { getCustomer } from "@/features/admin/data/customers";
import { CustomerMarketing, CustomerNotes } from "@/features/admin/components/customers/customer-panels";
import { CustomerAvatar, SegmentBadge } from "@/features/admin/components/customers/customers-table";
import { OrderStatusBadge } from "@/features/admin/components/orders/order-badges";
import { Card, PageHeader, TILE_CLASS, buttonClass } from "@/features/admin/components/ui";
import { formatDate, formatMoney, formatRelative } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/admin/customers/[id]">): Promise<Metadata> {
  const customer = getCustomer((await params).id);
  return { title: customer ? customer.name : "Customer not found" };
}

export default async function CustomerPage({ params }: PageProps<"/admin/customers/[id]">) {
  await requireAdmin();
  const now = new Date();
  const customer = getCustomer((await params).id, now);
  if (!customer) notFound();

  const digits = customer.phone.replace(/\D/g, "");
  const stats = [
    { label: "Total spent", value: formatMoney(customer.totalSpentPaise) },
    { label: "Orders", value: String(customer.ordersCount) },
    { label: "Average order", value: formatMoney(customer.avgOrderPaise) },
    { label: "Last order", value: formatRelative(customer.lastOrderAt, now) },
  ];
  const profile = [
    { label: "Usual size", value: customer.profile.topSize ?? "—" },
    { label: "Favourite category", value: customer.profile.topCategory ?? "—" },
    { label: "Prefers to pay by", value: customer.profile.preferredPayment === "COD" ? "Cash on delivery" : customer.profile.preferredPayment },
    { label: "Pieces bought", value: String(customer.profile.units) },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <PageHeader
        back={{ href: "/admin/customers", label: "Customers" }}
        title={
          <span className="flex items-center gap-3">
            <CustomerAvatar name={customer.name} className="size-10 text-[13px]" />
            {customer.name}
          </span>
        }
        meta={<SegmentBadge segment={customer.segment} />}
        description={`${customer.address.city}, ${customer.address.state} · Customer since ${formatDate(customer.since)}`}
        actions={
          <>
            <a href={`mailto:${customer.email}`} className={buttonClass.secondary}>
              <Mail className="size-4" strokeWidth={1.8} aria-hidden="true" />
              Email
            </a>
            <a href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer" className={buttonClass.secondary}>
              <MessageCircle className="size-4" strokeWidth={1.8} aria-hidden="true" />
              WhatsApp
            </a>
          </>
        }
      />

      <dl className={cn("adm-rise grid grid-cols-2 lg:grid-cols-4", TILE_CLASS)} style={{ "--adm-delay": "60ms" } as CSSProperties}>
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn("px-5 py-4", index % 2 === 1 ? "border-l border-adm-line" : "", index >= 2 ? "border-t border-adm-line lg:border-t-0" : "", index === 2 ? "lg:border-l" : "")}
          >
            <dt className="text-[12.5px] text-adm-ink-soft">{stat.label}</dt>
            <dd className="mt-1 text-[22px] leading-tight font-semibold tracking-[-0.02em] tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <Card title="Orders" description={`${customer.ordersCount} order${customer.ordersCount === 1 ? "" : "s"}, newest first`}>
            <ul className="-mx-5 -mt-2 -mb-5 divide-y divide-adm-line border-t border-adm-line">
              {customer.orders.map((order) => {
                const units = order.items.reduce((total, item) => total + item.quantity, 0);
                return (
                  <li key={order.id}>
                    <Link href={`/admin/orders/${order.id}`} className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-adm-surface-muted/50">
                      <span className="flex shrink-0 -space-x-3">
                        {order.items.slice(0, 2).map((item, index) => (
                          <span key={`${item.productId}-${index}`} className="relative size-10 overflow-hidden rounded-lg border-2 border-adm-surface bg-adm-surface-muted">
                            <Image src={item.image} alt="" fill sizes="40px" className="object-cover" />
                          </span>
                        ))}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium text-adm-ink tabular-nums group-hover:text-adm-accent">{order.number}</span>
                        <span className="block truncate text-[12px] text-adm-ink-faint">
                          {formatRelative(order.placedAt, now)} · {units} item{units === 1 ? "" : "s"} · {order.items[0].name}
                        </span>
                      </span>
                      <OrderStatusBadge status={order.status} className="hidden sm:inline-flex" />
                      <span className="w-20 text-right text-[13.5px] font-medium tabular-nums">{formatMoney(order.totalPaise)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title="Notes" description="Private to your team">
            <CustomerNotes customerId={customer.id} />
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <Card title="Contact">
            <ul className="-mt-1 flex flex-col gap-2.5 text-[13px]">
              <li>
                <a href={`mailto:${customer.email}`} className="flex items-center gap-2.5 text-adm-ink-soft hover:text-adm-accent">
                  <Mail className="size-4 text-adm-ink-faint" strokeWidth={1.8} aria-hidden="true" />
                  <span className="truncate">{customer.email}</span>
                </a>
              </li>
              <li>
                <a href={`tel:+${digits}`} className="flex items-center gap-2.5 text-adm-ink-soft tabular-nums hover:text-adm-accent">
                  <Phone className="size-4 text-adm-ink-faint" strokeWidth={1.8} aria-hidden="true" />
                  {customer.phone}
                </a>
              </li>
              <li className="flex gap-2.5 pt-1 text-adm-ink-soft">
                <MapPin className="mt-0.5 size-4 shrink-0 text-adm-ink-faint" strokeWidth={1.8} aria-hidden="true" />
                <address className="leading-relaxed not-italic">
                  {customer.address.line1}
                  <br />
                  {customer.address.city}, {customer.address.state} {customer.address.pincode}
                </address>
              </li>
            </ul>
          </Card>

          <Card title="Shopping profile" description="Worked out from their orders">
            <dl className="-mt-1 grid grid-cols-2 gap-x-4 gap-y-3">
              {profile.map((entry) => (
                <div key={entry.label}>
                  <dt className="text-[12px] text-adm-ink-faint">{entry.label}</dt>
                  <dd className="mt-0.5 text-[13.5px] font-medium">{entry.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title="Marketing">
            <CustomerMarketing customerId={customer.id} initial={customer.marketing} />
          </Card>
        </div>
      </div>
    </div>
  );
}
