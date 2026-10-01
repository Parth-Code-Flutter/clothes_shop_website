"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { BadgeCheck, Check, EyeOff, Loader2, MessageSquareQuote, Reply, Star, ThumbsUp } from "lucide-react";
import { replyToReviewAction, setReviewFeaturedAction, setReviewStatusAction } from "@/features/admin/reviews/actions";
import { useToast } from "@/features/admin/components/admin-toast";
import { buttonClass, inputClass } from "@/features/admin/components/ui";
import { FLAG_META, REPLY_MAX, REVIEW_STATUS_META, type ReviewFlag, type ReviewStatus } from "@/features/admin/lib/review-meta";
import { cn } from "@/lib/utils";

export type ReviewRow = {
  id: string;
  productName: string;
  productImage: string;
  productHref: string;
  categoryName: string;
  size: string;
  customerName: string;
  customerHref: string | null;
  orderHref: string | null;
  orderNumber: string | null;
  verified: boolean;
  rating: number;
  title: string;
  body: string;
  fitLabel: string | null;
  dateLabel: string;
  dateFull: string;
  status: ReviewStatus;
  featured: boolean;
  reply: { body: string; dateLabel: string } | null;
  helpful: number;
  flags: ReviewFlag[];
};

type Override = Partial<Pick<ReviewRow, "status" | "featured" | "reply">>;

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={cn("size-3.5", star <= rating ? "fill-adm-warning text-adm-warning" : "fill-adm-line text-adm-line")} strokeWidth={1.5} aria-hidden="true" />
      ))}
    </span>
  );
}

const SMALL = "h-8 px-2.5 text-[12.5px]";

export function ReviewsList({ rows, brand, emptyAction }: { rows: ReviewRow[]; brand: string; emptyAction?: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [replying, setReplying] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [toast, showToast] = useToast();

  const view = (row: ReviewRow) => ({ ...row, ...overrides[row.id] });
  const patch = (ids: string[], change: Override) =>
    setOverrides((current) => Object.fromEntries([...Object.entries(current), ...ids.map((id) => [id, { ...current[id], ...change }])]));

  const run = (key: string, task: () => Promise<{ ok: boolean; persisted: boolean; message: string }>, onOk: () => void) => {
    setBusy(key);
    startTransition(async () => {
      const result = await task();
      if (result.ok) onOk();
      showToast(result.message, !result.ok ? "error" : result.persisted ? "success" : "info");
      setBusy(null);
    });
  };

  const setStatus = (ids: string[], status: ReviewStatus) =>
    run(`${ids.join(",")}:${status}`, () => setReviewStatusAction(ids, status), () => {
      patch(ids, status === "hidden" ? { status, featured: false } : { status });
      setSelected(new Set());
    });

  const toggleSelected = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-adm-surface-muted text-adm-ink-faint">
          <MessageSquareQuote className="size-5" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="mt-4 text-[14px] font-medium">No reviews here</p>
        <p className="mt-1 text-[13px] text-adm-ink-faint">New reviews show up here for approval.</p>
        {emptyAction ? <div className="mt-4">{emptyAction}</div> : null}
      </div>
    );
  }

  const allSelected = rows.every((row) => selected.has(row.id));

  return (
    <>
      <div className="flex min-h-12 items-center gap-3 border-b border-adm-line px-4 py-2 sm:px-5">
        <label className="inline-flex cursor-pointer items-center gap-2.5 text-[12.5px] text-adm-ink-soft">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((row) => row.id)))}
            className="size-4 cursor-pointer rounded accent-[var(--adm-accent)]"
          />
          {selected.size ? `${selected.size} selected` : "Select all on this page"}
        </label>
        {selected.size ? (
          <div className="ml-auto flex items-center gap-2">
            <button type="button" disabled={Boolean(busy)} onClick={() => setStatus([...selected], "published")} className={cn(buttonClass.secondary, SMALL)}>
              <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
              Publish
            </button>
            <button type="button" disabled={Boolean(busy)} onClick={() => setStatus([...selected], "hidden")} className={cn(buttonClass.secondary, SMALL)}>
              <EyeOff className="size-3.5" strokeWidth={2} aria-hidden="true" />
              Hide
            </button>
          </div>
        ) : null}
      </div>

      <ul className="divide-y divide-adm-line">
        {rows.map((row) => {
          const review = view(row);
          const status = REVIEW_STATUS_META[review.status];
          const isReplying = replying === row.id;
          const suspicious = row.flags.includes("contact");
          return (
            <li key={row.id} className={cn("flex gap-3 px-4 py-4 sm:gap-4 sm:px-5", review.status === "pending" && "bg-adm-warning-soft/25")}>
              <input
                type="checkbox"
                checked={selected.has(row.id)}
                onChange={() => toggleSelected(row.id)}
                aria-label={`Select review by ${row.customerName}`}
                className="mt-1 size-4 shrink-0 cursor-pointer rounded accent-[var(--adm-accent)]"
              />

              <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:gap-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <Stars rating={row.rating} />
                    <span className={cn("rounded-full px-2 py-0.5 text-[11.5px] font-medium", status.className)}>{status.label}</span>
                    {review.featured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-adm-accent-soft px-2 py-0.5 text-[11.5px] font-medium text-adm-accent">
                        <Star className="size-3 fill-current" strokeWidth={2} aria-hidden="true" />
                        Featured
                      </span>
                    ) : null}
                    {row.flags.map((flag) => (
                      <span key={flag} title={FLAG_META[flag].hint} className={cn("rounded-full px-2 py-0.5 text-[11.5px] font-medium", FLAG_META[flag].className)}>
                        {FLAG_META[flag].label}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[14px] font-semibold">{row.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-adm-ink-soft">{row.body}</p>

                  <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-adm-ink-faint">
                    {row.customerHref ? (
                      <Link href={row.customerHref} className="font-medium text-adm-ink hover:text-adm-accent">
                        {row.customerName}
                      </Link>
                    ) : (
                      <span className="font-medium text-adm-ink">{row.customerName}</span>
                    )}
                    {row.verified ? (
                      <span className="inline-flex items-center gap-1 text-adm-success">
                        <BadgeCheck className="size-3.5" strokeWidth={2} aria-hidden="true" />
                        Verified buyer
                      </span>
                    ) : null}
                    <span aria-hidden="true">·</span>
                    <span>Size {row.size}</span>
                    {row.fitLabel ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{row.fitLabel}</span>
                      </>
                    ) : null}
                    <span aria-hidden="true">·</span>
                    <time title={row.dateFull}>{row.dateLabel}</time>
                    {row.orderHref ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <Link href={row.orderHref} className="hover:text-adm-accent">
                          {row.orderNumber}
                        </Link>
                      </>
                    ) : null}
                    {row.helpful ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp className="size-3" strokeWidth={2} aria-hidden="true" />
                          {row.helpful} found helpful
                        </span>
                      </>
                    ) : null}
                  </p>

                  {review.reply && !isReplying ? (
                    <div className="mt-3 rounded-lg border-l-2 border-adm-accent bg-adm-surface-muted/60 px-3 py-2">
                      <p className="text-[12px] font-medium text-adm-ink">
                        Reply from {brand} <span className="font-normal text-adm-ink-faint">· {review.reply.dateLabel}</span>
                      </p>
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-adm-ink-soft">{review.reply.body}</p>
                    </div>
                  ) : null}

                  {isReplying ? (
                    <div className="mt-3 flex flex-col gap-2">
                      <label htmlFor={`reply-${row.id}`} className="text-[12.5px] font-medium">
                        Public reply
                      </label>
                      <textarea
                        id={`reply-${row.id}`}
                        rows={3}
                        maxLength={REPLY_MAX}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        autoFocus
                        placeholder={`Hi ${row.customerName.split(" ")[0]}, thank you for…`}
                        className={cn(inputClass, "h-auto resize-y py-2 leading-relaxed")}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={busy === `${row.id}:reply` || draft.trim().length < 2}
                          onClick={() =>
                            run(`${row.id}:reply`, () => replyToReviewAction(row.id, draft), () => {
                              patch([row.id], { reply: { body: draft.trim(), dateLabel: "just now" } });
                              setReplying(null);
                            })
                          }
                          className={cn(buttonClass.primary, SMALL)}
                        >
                          {busy === `${row.id}:reply` ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
                          {review.reply ? "Update reply" : "Post reply"}
                        </button>
                        <button type="button" onClick={() => setReplying(null)} className={cn(buttonClass.ghost, SMALL)}>
                          Cancel
                        </button>
                        {review.reply ? (
                          <button
                            type="button"
                            onClick={() =>
                              run(`${row.id}:reply`, () => replyToReviewAction(row.id, ""), () => {
                                patch([row.id], { reply: null });
                                setReplying(null);
                              })
                            }
                            className={cn(buttonClass.ghost, SMALL, "text-adm-danger hover:bg-adm-danger-soft hover:text-adm-danger")}
                          >
                            Remove reply
                          </button>
                        ) : null}
                        <span className="ml-auto text-[11.5px] text-adm-ink-faint tabular-nums">
                          {draft.length}/{REPLY_MAX}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {review.status !== "published" ? (
                      <button
                        type="button"
                        disabled={Boolean(busy)}
                        onClick={() => setStatus([row.id], "published")}
                        className={cn(review.status === "pending" && !suspicious ? buttonClass.primary : buttonClass.secondary, SMALL)}
                      >
                        <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
                        {review.status === "pending" ? "Approve" : "Publish"}
                      </button>
                    ) : null}
                    {review.status !== "hidden" ? (
                      <button
                        type="button"
                        disabled={Boolean(busy)}
                        onClick={() => setStatus([row.id], "hidden")}
                        className={cn(review.status === "pending" && suspicious ? buttonClass.primary : buttonClass.secondary, SMALL)}
                      >
                        <EyeOff className="size-3.5" strokeWidth={2} aria-hidden="true" />
                        Hide
                      </button>
                    ) : null}
                    {review.status === "published" ? (
                      <>
                        <button
                          type="button"
                          disabled={Boolean(busy)}
                          onClick={() => {
                            setReplying(row.id);
                            setDraft(review.reply?.body ?? "");
                          }}
                          className={cn(buttonClass.secondary, SMALL)}
                        >
                          <Reply className="size-3.5" strokeWidth={2} aria-hidden="true" />
                          {review.reply ? "Edit reply" : "Reply"}
                        </button>
                        <button
                          type="button"
                          aria-pressed={review.featured}
                          disabled={Boolean(busy)}
                          onClick={() => run(`${row.id}:feature`, () => setReviewFeaturedAction(row.id, !review.featured), () => patch([row.id], { featured: !review.featured }))}
                          className={cn(buttonClass.ghost, SMALL, review.featured && "text-adm-accent")}
                        >
                          <Star className={cn("size-3.5", review.featured && "fill-current")} strokeWidth={2} aria-hidden="true" />
                          {review.featured ? "Unfeature" : "Feature"}
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                <Link href={row.productHref} className="group flex shrink-0 items-center gap-3 self-start rounded-xl border border-adm-line p-2 pr-3 transition-colors hover:border-adm-line-strong lg:w-56">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-adm-surface-muted">
                    <Image src={row.productImage} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-[12.5px] leading-snug font-medium group-hover:text-adm-accent">{row.productName}</span>
                    <span className="block text-[11.5px] text-adm-ink-faint">{row.categoryName}</span>
                  </span>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      {toast}
    </>
  );
}
