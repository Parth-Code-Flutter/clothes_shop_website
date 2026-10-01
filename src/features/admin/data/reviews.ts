import "server-only";
import { adminBrand } from "@/features/admin/config/admin-brand";
import { customerIdFor, getCustomers } from "@/features/admin/data/customers";
import { getOrders } from "@/features/admin/data/orders";
import { getAdminProducts, type AdminProduct } from "@/features/admin/data/products";
import { hasContactDetails, type ReviewFit, type ReviewFlag, type ReviewStatus } from "@/features/admin/lib/review-meta";

/**
 * SAMPLE reviews. Recent ones come from delivered sample orders (so the
 * customer, product and size match a real order); older ones fill in history.
 * New reviews wait for approval for about two and a half days. Writes go
 * through `reviewStore`.
 */

export type Review = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  categoryName: string;
  size: string;
  customerName: string;
  customerId: string | null;
  orderId: string | null;
  verified: boolean;
  rating: number;
  title: string;
  body: string;
  fit: ReviewFit | null;
  createdAt: string;
  status: ReviewStatus;
  featured: boolean;
  reply: { body: string; at: string } | null;
  helpful: number;
  flags: ReviewFlag[];
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const PENDING_FOR_MS = 60 * HOUR_MS;
const HISTORY = 64;

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** [title, body] pairs per star rating. */
const TEXTS: Record<number, [string, string][]> = {
  5: [
    ["My new favourite", "Honestly the best {item} I own right now. The {color} looks even richer in person and hasn't faded after a few washes."],
    ["Premium quality", "Ordered on a whim and I'm glad I did. Fabric feels premium, stitching is neat, and it arrived well packed."],
    ["Fits perfectly", "Got so many compliments the first day I wore it. Fits exactly like the size chart says."],
    ["Worth every rupee", "Quality is way above what I expected at this price. Already eyeing a second colour."],
    ["Absolutely love it", "Soft, breathable and the colour is spot on. Perfect for college and weekend plans."],
    ["Best purchase this month", "Delivery was quick and the packaging felt like a gift. The {item} itself is fantastic."],
  ],
  4: [
    ["Great, with one small issue", "Really nice {item}. One star off because it creased a bit after the first wash, but I still love it."],
    ["Really good", "Good fabric and a great look. Delivery took a day longer than shown."],
    ["Happy with it", "Looks exactly like the photos. Slightly long for me, but nothing a tuck or a fold can't fix."],
    ["Nice fabric", "Comfortable and well made. Would love more colours in this style."],
    ["Good value", "Solid buy for the price. The {color} is a little darker than on screen."],
  ],
  3: [
    ["Expected a bit more", "Decent {item}, nothing special. The fabric is thinner than I expected."],
    ["Fit is boxy", "Looks nice but the fit is boxier than the photos suggest."],
    ["It's okay", "Okay for casual wear. The colour faded slightly after two washes."],
    ["Average", "It's fine. Took a while to arrive and the packaging was a bit crushed."],
  ],
  2: [
    ["Sizing is off", "Not happy with the size. Ordered my usual {size} and it's tight around the {area}."],
    ["Colour mismatch", "The colour looks quite different from the website. Expected a brighter {color}."],
    ["Quality issue", "Stitching came loose near the hem after one wash. Disappointed."],
  ],
  1: [
    ["Very disappointed", "Received the wrong size and still waiting on the exchange. Very frustrating."],
    ["Not worth it", "The fabric started pilling after the first wash. Not worth the price."],
    ["Poor quality", "Fell apart within a week. Would not recommend."],
  ],
};

const REPLIES = {
  low: "Hi {first}, we're sorry the {item} didn't live up to expectations. We've messaged you to arrange a free exchange or refund. Team {brand}",
  mid: "Thanks for the honest feedback, {first}. We've shared your notes with our production team so the next batch is even better.",
  high: "Thank you so much, {first}! We're thrilled you love it. Tag us when you wear it.",
};

const ITEM: Record<string, string> = { "t-shirts": "tee", shirts: "shirt", jeans: "jeans", trousers: "trousers" };

function pickRating(roll: number) {
  if (roll < 0.48) return 5;
  if (roll < 0.76) return 4;
  if (roll < 0.88) return 3;
  if (roll < 0.95) return 2;
  return 1;
}

function fill(template: string, product: AdminProduct, size: string, customerName = "") {
  const bottoms = product.categoryId === "jeans" || product.categoryId === "trousers";
  return template
    .replaceAll("{item}", ITEM[product.categoryId] ?? "piece")
    .replaceAll("{color}", product.color.toLowerCase())
    .replaceAll("{size}", size)
    .replaceAll("{area}", bottoms ? "waist" : "shoulders")
    .replaceAll("{first}", customerName.split(" ")[0] ?? "")
    .replaceAll("{brand}", adminBrand.name);
}

let cache: { anchor: number; reviews: Review[] } | null = null;

export function getReviews(now = new Date()): Review[] {
  const anchor = Math.floor(now.getTime() / HOUR_MS);
  if (cache?.anchor === anchor) return cache.reviews;

  const random = mulberry32(Math.floor(now.getTime() / DAY_MS) * 4253 + 17);
  const pick = <T,>(list: readonly T[]) => list[Math.floor(random() * list.length)];
  const products = getAdminProducts();
  const byId = new Map(products.map((product) => [product.id, product]));
  const nowMs = now.getTime();
  const drafts: Omit<Review, "id" | "flags" | "featured">[] = [];

  const write = (product: AdminProduct, size: string, customerName: string, createdMs: number, { returned, ...extra }: Partial<Review> & { returned?: boolean }) => {
    const sizing = random() < 0.35;
    let rating = pickRating(random());
    if (returned) rating = Math.min(rating, 2 + Math.floor(random() * 2));
    const [title, template] = pick(TEXTS[rating]);
    let body = fill(template, product, size);
    let fit: ReviewFit | null = random() < 0.75 ? (random() < 0.66 ? "true" : random() < 0.5 ? "small" : "large") : null;
    if (body.includes("tight around")) fit = "small";
    if (sizing && rating >= 4 && fit === "true") body += " Size " + size + " was perfect.";
    const age = nowMs - createdMs;
    const status: ReviewStatus = age < PENDING_FOR_MS ? "pending" : rating <= 2 && random() < 0.15 ? "hidden" : "published";
    const replyKind = rating <= 2 ? "low" : rating === 3 ? "mid" : "high";
    const replies = status === "published" && random() < (rating <= 3 ? 0.7 : 0.18);
    drafts.push({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      categoryName: product.categoryName,
      size,
      customerName,
      customerId: customerIdFor(customerName),
      orderId: null,
      verified: true,
      rating,
      title,
      body,
      fit,
      createdAt: new Date(createdMs).toISOString(),
      status,
      reply: replies ? { body: fill(REPLIES[replyKind], product, size, customerName), at: new Date(Math.min(nowMs, createdMs + (3 + random() * 30) * HOUR_MS)).toISOString() } : null,
      helpful: status === "published" ? Math.floor(random() * random() * 24) : 0,
      ...extra,
    });
  };

  for (const order of getOrders(now)) {
    const delivered = order.events.find((event) => event.label === "Delivered to customer");
    if (!delivered) continue;
    const returned = order.status === "return_requested" || order.status === "refunded";
    if (random() > 0.5) continue;
    const item = pick(order.items);
    const createdMs = new Date(delivered.at).getTime() + (6 + random() * 66) * HOUR_MS;
    const product = byId.get(item.productId);
    if (!product || createdMs > nowMs) continue;
    write(product, item.size, order.customer.name, createdMs, { orderId: order.id, returned });
  }

  const customers = getCustomers(now);
  for (let index = 0; index < HISTORY; index += 1) {
    const product = pick(products);
    const customer = pick(customers);
    write(product, pick(product.sizes), customer.name, nowMs - (10 + random() * 140) * DAY_MS - random() * DAY_MS, {});
  }

  const spamProduct = products[3];
  drafts.push({
    productId: spamProduct.id,
    productName: spamProduct.name,
    productImage: spamProduct.image,
    categoryName: spamProduct.categoryName,
    size: spamProduct.sizes[1] ?? spamProduct.sizes[0],
    customerName: "Deals Hub",
    customerId: null,
    orderId: null,
    verified: false,
    rating: 5,
    title: "Cheaper here",
    body: "Nice design! Get the same prints for half price at trendzdeals.in or WhatsApp 98250 11223.",
    fit: null,
    createdAt: new Date(nowMs - 5 * HOUR_MS).toISOString(),
    status: "pending",
    reply: null,
    helpful: 0,
  });

  drafts.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const featured = new Set(
    drafts
      .filter((draft) => draft.status === "published" && draft.rating === 5)
      .sort((a, b) => b.body.length - a.body.length || b.helpful - a.helpful)
      .slice(0, 4)
      .map((draft) => draft.createdAt),
  );

  const returnedOrders = new Set(getOrders(now).filter((order) => order.status === "return_requested" || order.status === "refunded").map((order) => order.id));
  const reviews: Review[] = drafts
    .map((draft, index) => {
      const flags: ReviewFlag[] = [];
      if (hasContactDetails(`${draft.title} ${draft.body}`)) flags.push("contact");
      if (draft.rating <= 2) flags.push("low_rating");
      if (draft.orderId && returnedOrders.has(draft.orderId)) flags.push("returned");
      if (!draft.verified) flags.push("unverified");
      return { ...draft, id: `R-${1001 + index}`, featured: featured.has(draft.createdAt), flags };
    })
    .reverse();

  cache = { anchor, reviews };
  return reviews;
}

export function getReview(id: string, now = new Date()) {
  return getReviews(now).find((review) => review.id === id);
}

export function getReviewStats(now = new Date()) {
  const reviews = getReviews(now);
  const published = reviews.filter((review) => review.status === "published");
  const lowOnes = published.filter((review) => review.rating <= 3);
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: published.filter((review) => review.rating === stars).length }));
  return {
    total: reviews.length,
    published: published.length,
    pending: reviews.filter((review) => review.status === "pending").length,
    average: published.length ? published.reduce((total, review) => total + review.rating, 0) / published.length : 0,
    needsReply: lowOnes.filter((review) => !review.reply).length,
    replyRate: lowOnes.length ? lowOnes.filter((review) => review.reply).length / lowOnes.length : 1,
    featured: published.filter((review) => review.featured).length,
    distribution,
  };
}

// Listing query --------------------------------------------------------------

export const REVIEW_VIEWS = ["all", "pending", "published", "needs_reply", "featured", "hidden"] as const;
export type ReviewView = (typeof REVIEW_VIEWS)[number];

export const REVIEW_SORTS = ["newest", "oldest", "rating-asc", "rating-desc", "helpful"] as const;
export type ReviewSort = (typeof REVIEW_SORTS)[number];

export type ReviewQuery = { q: string; view: ReviewView; rating: string; sort: ReviewSort; page: number };

export const REVIEWS_PAGE_SIZE = 10;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseReviewQuery(params: Record<string, string | string[] | undefined>): ReviewQuery {
  const view = first(params.view) as ReviewView;
  const sort = first(params.sort) as ReviewSort;
  const rating = first(params.rating);
  const page = Number.parseInt(first(params.page), 10);
  return {
    q: first(params.q).trim().slice(0, 80),
    view: REVIEW_VIEWS.includes(view) ? view : "all",
    rating: ["1", "2", "3", "4", "5"].includes(rating) ? rating : "",
    sort: REVIEW_SORTS.includes(sort) ? sort : "newest",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

const VIEW_FILTER: Record<ReviewView, (review: Review) => boolean> = {
  all: () => true,
  pending: (review) => review.status === "pending",
  published: (review) => review.status === "published",
  needs_reply: (review) => review.status === "published" && review.rating <= 3 && !review.reply,
  featured: (review) => review.status === "published" && review.featured,
  hidden: (review) => review.status === "hidden",
};

const SORTERS: Record<ReviewSort, (a: Review, b: Review) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
  "rating-asc": (a, b) => a.rating - b.rating || b.createdAt.localeCompare(a.createdAt),
  "rating-desc": (a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt),
  helpful: (a, b) => b.helpful - a.helpful || b.createdAt.localeCompare(a.createdAt),
};

export function queryReviews(query: ReviewQuery, now = new Date()) {
  const needle = query.q.toLowerCase();
  const scoped = getReviews(now).filter(
    (review) =>
      (!query.rating || review.rating === Number(query.rating)) &&
      (!needle || [review.productName, review.customerName, review.title, review.body, review.id].some((field) => field.toLowerCase().includes(needle))),
  );
  const counts = Object.fromEntries(REVIEW_VIEWS.map((view) => [view, scoped.filter(VIEW_FILTER[view]).length])) as Record<ReviewView, number>;
  const sorted = scoped.filter(VIEW_FILTER[query.view]).sort(SORTERS[query.sort]);
  const pageCount = Math.max(1, Math.ceil(sorted.length / REVIEWS_PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  return { items: sorted.slice((page - 1) * REVIEWS_PAGE_SIZE, page * REVIEWS_PAGE_SIZE), total: sorted.length, page, pageCount, counts };
}

// Writes ---------------------------------------------------------------------

/**
 * The single place review writes go through. Reviews are sample data for now,
 * so these report `persisted: false`; replace the bodies with database calls.
 */
export const reviewStore = {
  async setStatus(ids: string[], status: ReviewStatus): Promise<{ persisted: boolean }> {
    void ids;
    void status;
    return { persisted: false };
  },
  async setFeatured(id: string, featured: boolean): Promise<{ persisted: boolean }> {
    void id;
    void featured;
    return { persisted: false };
  },
  async reply(id: string, body: string | null): Promise<{ persisted: boolean }> {
    void id;
    void body;
    return { persisted: false };
  },
};
