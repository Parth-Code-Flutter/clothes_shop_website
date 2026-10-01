"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import type { ReviewQuery, ReviewSort } from "@/features/admin/data/reviews";
import { inputClass } from "@/features/admin/components/ui";
import { reviewsHref } from "@/features/admin/lib/reviews-url";
import { cn } from "@/lib/utils";

const SORT_LABELS: Record<ReviewSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  "rating-asc": "Lowest rated",
  "rating-desc": "Highest rated",
  helpful: "Most helpful",
};

export function ReviewsFilters({ query }: { query: ReviewQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState(query.q);
  const [sentQ, setSentQ] = useState(query.q);
  const [seenQ, setSeenQ] = useState(query.q);
  const inputRef = useRef<HTMLInputElement>(null);

  if (query.q !== seenQ) {
    setSeenQ(query.q);
    if (query.q !== sentQ) {
      setText(query.q);
      setSentQ(query.q);
    }
  }

  const go = (patch: Partial<ReviewQuery>) => {
    if (patch.q !== undefined) setSentQ(patch.q);
    startTransition(() => router.replace(reviewsHref(query, patch), { scroll: false }));
  };

  useEffect(() => {
    if (text.trim() === sentQ) return;
    const timer = window.setTimeout(() => go({ q: text.trim() }), 300);
    return () => window.clearTimeout(timer);
    // Only the typed text should restart the debounce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const selectClass = cn(inputClass, "w-auto cursor-pointer appearance-none bg-[length:16px] bg-[right_8px_center] bg-no-repeat pr-8");
  const chevron = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239a9aa3' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label className="relative min-w-0 flex-1 sm:max-w-xs">
        <span className="sr-only">Search reviews</span>
        {pending ? (
          <Loader2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin text-adm-ink-faint" aria-hidden="true" />
        ) : (
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-adm-ink-faint" strokeWidth={1.8} aria-hidden="true" />
        )}
        <input
          ref={inputRef}
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Product, customer or words"
          className={cn(inputClass, "pr-8 pl-9 [&::-webkit-search-cancel-button]:hidden")}
        />
        {text ? (
          <button
            type="button"
            onClick={() => {
              setText("");
              go({ q: "" });
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute top-1/2 right-1.5 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-adm-ink-faint hover:bg-adm-surface-muted hover:text-adm-ink"
          >
            <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
          </button>
        ) : null}
      </label>

      <div className="flex gap-2">
        <label className="min-w-0 flex-1 sm:flex-none">
          <span className="sr-only">Rating</span>
          <select value={query.rating} onChange={(event) => go({ rating: event.target.value })} className={cn(selectClass, "w-full sm:w-auto")} style={chevron}>
            <option value="">All ratings</option>
            {["5", "4", "3", "2", "1"].map((stars) => (
              <option key={stars} value={stars}>
                {stars} {stars === "1" ? "star" : "stars"}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0 flex-1 sm:flex-none">
          <span className="sr-only">Sort by</span>
          <select value={query.sort} onChange={(event) => go({ sort: event.target.value as ReviewSort })} className={cn(selectClass, "w-full sm:w-auto")} style={chevron}>
            {(Object.keys(SORT_LABELS) as ReviewSort[]).map((sort) => (
              <option key={sort} value={sort}>
                {SORT_LABELS[sort]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
