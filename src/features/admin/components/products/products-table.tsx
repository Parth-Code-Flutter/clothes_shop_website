"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { Archive, ExternalLink, FileEdit, MoreHorizontal, PackageX, PencilLine, Trash2, CircleCheck, X } from "lucide-react";
import type { AdminProduct, ProductStatus } from "@/features/admin/data/products";
import { bulkProductAction, type BulkAction } from "@/features/admin/products/actions";
import { useToast } from "@/features/admin/components/admin-toast";
import { buttonClass } from "@/features/admin/components/ui";
import { formatMoney } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

export type ProductRow = Pick<
  AdminProduct,
  "id" | "slug" | "sku" | "name" | "categoryName" | "status" | "image" | "color" | "pricePaise" | "mrpPaise" | "stock" | "totalStock" | "stockState" | "updatedDaysAgo"
>;

const STATUS_STYLE: Record<ProductStatus, string> = {
  active: "bg-adm-success-soft text-adm-success",
  draft: "bg-adm-surface-muted text-adm-ink-soft",
  archived: "bg-adm-warning-soft text-adm-warning",
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium capitalize", STATUS_STYLE[status])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}

function SizeChips({ stock, threshold }: { stock: Record<string, number>; threshold: number }) {
  return (
    <span className="flex flex-wrap gap-1">
      {Object.entries(stock).map(([size, left]) => (
        <span
          key={size}
          title={left === 0 ? `Size ${size}: sold out` : `Size ${size}: ${left} left`}
          className={cn(
            "inline-flex h-5 min-w-6 items-center justify-center rounded px-1 text-[10.5px] font-semibold tabular-nums",
            left === 0
              ? "bg-adm-danger-soft text-adm-danger line-through decoration-1"
              : left <= threshold
                ? "bg-adm-warning-soft text-adm-warning"
                : "bg-adm-surface-muted text-adm-ink-soft",
          )}
        >
          {size}
        </span>
      ))}
    </span>
  );
}

function StockCell({ product, threshold }: { product: ProductRow; threshold: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={cn("text-[13px] tabular-nums", product.stockState === "out" ? "font-medium text-adm-danger" : "text-adm-ink")}>
        {product.stockState === "out" ? "Out of stock" : `${product.totalStock} in stock`}
      </span>
      <SizeChips stock={product.stock} threshold={threshold} />
    </div>
  );
}

function Price({ product }: { product: ProductRow }) {
  const onOffer = product.mrpPaise && product.mrpPaise > product.pricePaise;
  return (
    <span className="flex flex-col items-end">
      <span className="font-medium text-adm-ink tabular-nums">{formatMoney(product.pricePaise)}</span>
      {onOffer ? <span className="text-[12px] text-adm-ink-faint tabular-nums line-through">{formatMoney(product.mrpPaise!)}</span> : null}
    </span>
  );
}

function updatedLabel(days: number) {
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function RowMenu({ product, onAction }: { product: ProductRow; onAction: (ids: string[], action: BulkAction) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const item = "flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-[13px] transition-colors";
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Actions for ${product.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex size-8 items-center justify-center rounded-lg text-adm-ink-faint transition-colors hover:bg-adm-surface-muted hover:text-adm-ink focus-visible:outline-2 focus-visible:outline-adm-accent"
      >
        <MoreHorizontal className="size-4" strokeWidth={2} aria-hidden="true" />
      </button>
      {open ? (
        <div role="menu" className="absolute top-[calc(100%+4px)] right-0 z-30 w-48 rounded-xl border border-adm-line bg-adm-surface p-1 shadow-[0_18px_50px_-18px_rgb(0_0_0/0.4)]">
          <Link role="menuitem" href={`/admin/products/${product.id}`} className={cn(item, "text-adm-ink hover:bg-adm-surface-muted")}>
            <PencilLine className="size-4 text-adm-ink-faint" strokeWidth={1.8} aria-hidden="true" />
            Edit product
          </Link>
          <a role="menuitem" href={`/product/${product.slug}`} target="_blank" rel="noreferrer" className={cn(item, "text-adm-ink hover:bg-adm-surface-muted")}>
            <ExternalLink className="size-4 text-adm-ink-faint" strokeWidth={1.8} aria-hidden="true" />
            View in store
          </a>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              onAction([product.id], product.status === "archived" ? "active" : "archived");
            }}
            className={cn(item, "text-adm-ink hover:bg-adm-surface-muted")}
          >
            <Archive className="size-4 text-adm-ink-faint" strokeWidth={1.8} aria-hidden="true" />
            {product.status === "archived" ? "Unarchive" : "Archive"}
          </button>
          <div className="my-1 h-px bg-adm-line" />
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              onAction([product.id], "delete");
            }}
            className={cn(item, "text-adm-danger hover:bg-adm-danger-soft")}
          >
            <Trash2 className="size-4" strokeWidth={1.8} aria-hidden="true" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ProductsTable({ products, threshold, emptyAction }: { products: ProductRow[]; threshold: number; emptyAction: ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [toast, showToast] = useToast();

  const ids = products.map((product) => product.id);
  const visibleSelected = ids.filter((id) => selected.has(id));
  const allSelected = ids.length > 0 && visibleSelected.length === ids.length;
  const someSelected = visibleSelected.length > 0 && !allSelected;

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(ids));

  const run = (targets: string[], action: BulkAction) => {
    if (action === "delete" && !window.confirm(targets.length === 1 ? "Delete this product? This can't be undone." : `Delete ${targets.length} products? This can't be undone.`)) return;
    startTransition(async () => {
      const result = await bulkProductAction(targets, action);
      showToast(result.message, result.persisted ? "success" : "info");
      if (result.persisted) setSelected(new Set());
    });
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-adm-surface-muted text-adm-ink-faint">
          <PackageX className="size-5" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="mt-4 text-[14px] font-medium">No products match these filters</p>
        <p className="mt-1 text-[13px] text-adm-ink-faint">Try another search, or clear the filters to see everything.</p>
        <div className="mt-4">{emptyAction}</div>
      </div>
    );
  }

  const checkbox = "size-4 cursor-pointer rounded border-adm-line-strong accent-[var(--adm-accent)]";

  return (
    <>
      {visibleSelected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1 border-b border-adm-line bg-adm-accent-soft/60 px-3 py-2 sm:px-5">
          <span className="mr-2 text-[13px] font-medium text-adm-ink tabular-nums">{visibleSelected.length} selected</span>
          <button type="button" disabled={pending} onClick={() => run(visibleSelected, "active")} className={cn(buttonClass.ghost, "h-8")}>
            <CircleCheck className="size-4" strokeWidth={1.8} aria-hidden="true" /> Set active
          </button>
          <button type="button" disabled={pending} onClick={() => run(visibleSelected, "draft")} className={cn(buttonClass.ghost, "h-8")}>
            <FileEdit className="size-4" strokeWidth={1.8} aria-hidden="true" /> Set draft
          </button>
          <button type="button" disabled={pending} onClick={() => run(visibleSelected, "archived")} className={cn(buttonClass.ghost, "h-8")}>
            <Archive className="size-4" strokeWidth={1.8} aria-hidden="true" /> Archive
          </button>
          <button type="button" disabled={pending} onClick={() => run(visibleSelected, "delete")} className={cn(buttonClass.danger, "h-8")}>
            <Trash2 className="size-4" strokeWidth={1.8} aria-hidden="true" /> Delete
          </button>
          <button type="button" onClick={() => setSelected(new Set())} aria-label="Clear selection" className={cn(buttonClass.ghost, "ml-auto size-8 px-0")}>
            <X className="size-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className="hidden md:block">
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-adm-line text-[12px] text-adm-ink-faint">
              <th scope="col" className="w-10 py-2.5 pr-2 pl-5">
                <input
                  type="checkbox"
                  aria-label="Select all products on this page"
                  checked={allSelected}
                  ref={(node) => {
                    if (node) node.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  className={checkbox}
                />
              </th>
              <th scope="col" className="py-2.5 pr-3 font-medium">Product</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Inventory</th>
              <th scope="col" className="hidden px-3 py-2.5 font-medium xl:table-cell">Category</th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">Price</th>
              <th scope="col" className="hidden px-3 py-2.5 font-medium lg:table-cell">Updated</th>
              <th scope="col" className="w-12 py-2.5 pr-4 pl-1">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-adm-line">
            {products.map((product) => {
              const isSelected = selected.has(product.id);
              return (
                <tr key={product.id} className={cn("group transition-colors", isSelected ? "bg-adm-accent-soft/40" : "hover:bg-adm-surface-muted/50")}>
                  <td className="py-3 pr-2 pl-5">
                    <input type="checkbox" aria-label={`Select ${product.name}`} checked={isSelected} onChange={() => toggle(product.id)} className={checkbox} />
                  </td>
                  <td className="py-3 pr-3">
                    <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3 focus-visible:outline-none">
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-adm-line bg-adm-surface-muted">
                        <Image src={product.image} alt="" fill sizes="44px" className="object-cover" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-adm-ink group-hover:text-adm-accent">{product.name}</span>
                        <span className="block truncate text-[12px] text-adm-ink-faint">
                          {product.sku} · {product.color}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <ProductStatusBadge status={product.status} />
                  </td>
                  <td className="px-3 py-3">
                    <StockCell product={product} threshold={threshold} />
                  </td>
                  <td className="hidden px-3 py-3 text-adm-ink-soft xl:table-cell">{product.categoryName}</td>
                  <td className="px-3 py-3 text-right">
                    <Price product={product} />
                  </td>
                  <td className="hidden px-3 py-3 text-[12.5px] whitespace-nowrap text-adm-ink-faint lg:table-cell">{updatedLabel(product.updatedDaysAgo)}</td>
                  <td className="py-3 pr-4 pl-1">
                    <RowMenu product={product} onAction={run} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-adm-line md:hidden">
        {products.map((product) => (
          <li key={product.id} className="flex gap-3 px-4 py-3.5">
            <input type="checkbox" aria-label={`Select ${product.name}`} checked={selected.has(product.id)} onChange={() => toggle(product.id)} className={cn(checkbox, "mt-1")} />
            <Link href={`/admin/products/${product.id}`} className="flex min-w-0 flex-1 gap-3">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-adm-line bg-adm-surface-muted">
                <Image src={product.image} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="truncate text-[14px] font-medium">{product.name}</span>
                  <Price product={product} />
                </span>
                <span className="text-[12px] text-adm-ink-faint">{product.sku}</span>
                <span className="flex flex-wrap items-center gap-2">
                  <ProductStatusBadge status={product.status} />
                  <SizeChips stock={product.stock} threshold={threshold} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {toast}
    </>
  );
}
