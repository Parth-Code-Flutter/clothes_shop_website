"use server";

import { requireAdmin } from "@/features/admin/auth/dal";
import { getReviews, reviewStore } from "@/features/admin/data/reviews";
import { REPLY_MAX, REVIEW_STATUSES, type ReviewStatus } from "@/features/admin/lib/review-meta";

type Result = { ok: boolean; persisted: boolean; message: string };

const PREVIEW_NOTE = "Saving switches on once the reviews database is connected.";

function done(persisted: boolean, label: string): Result {
  return { ok: true, persisted, message: persisted ? `${label}.` : `${label} (preview). ${PREVIEW_NOTE}` };
}

export async function setReviewStatusAction(ids: string[], status: ReviewStatus): Promise<Result> {
  await requireAdmin();
  if (!REVIEW_STATUSES.includes(status) || status === "pending") return { ok: false, persisted: false, message: "Choose publish or hide." };
  const wanted = new Set((Array.isArray(ids) ? ids : []).map(String).slice(0, 100));
  const found = getReviews().filter((review) => wanted.has(review.id));
  if (found.length === 0) return { ok: false, persisted: false, message: "Those reviews no longer exist." };
  const result = await reviewStore.setStatus(
    found.map((review) => review.id),
    status,
  );
  const noun = found.length === 1 ? "Review" : `${found.length} reviews`;
  return done(result.persisted, `${noun} ${status === "published" ? "published" : "hidden"}`);
}

export async function setReviewFeaturedAction(id: string, featured: boolean): Promise<Result> {
  await requireAdmin();
  const review = getReviews().find((entry) => entry.id === id);
  if (!review) return { ok: false, persisted: false, message: "That review no longer exists." };
  if (featured && review.status !== "published") return { ok: false, persisted: false, message: "Publish the review before featuring it." };
  const result = await reviewStore.setFeatured(review.id, Boolean(featured));
  return done(result.persisted, featured ? "Featured on the product page" : "No longer featured");
}

export async function replyToReviewAction(id: string, body: string): Promise<Result> {
  await requireAdmin();
  const review = getReviews().find((entry) => entry.id === id);
  if (!review) return { ok: false, persisted: false, message: "That review no longer exists." };
  const text = String(body ?? "").trim();
  if (text && text.length < 2) return { ok: false, persisted: false, message: "Write a little more before replying." };
  if (text.length > REPLY_MAX) return { ok: false, persisted: false, message: `Keep replies under ${REPLY_MAX} characters.` };
  if (text && review.status === "hidden") return { ok: false, persisted: false, message: "Publish the review before replying; hidden reviews aren't shown." };
  const result = await reviewStore.reply(review.id, text || null);
  return done(result.persisted, text ? (review.reply ? "Reply updated" : "Reply posted") : "Reply removed");
}
