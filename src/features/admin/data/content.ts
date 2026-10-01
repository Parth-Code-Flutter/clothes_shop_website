import "server-only";
import { siteConfig } from "@/config/site";
import { HOME_SECTIONS, type PageStatus, type SiteContent } from "@/features/admin/lib/content-meta";

/**
 * SAMPLE storefront content. The site copy mirrors what the storefront shows
 * today (premiere opener, footer marquee and footer text); the pages are the
 * ones linked from the footer. The storefront doesn't read from here yet.
 * Writes go through `contentStore`.
 */

const { contact } = siteConfig;

const SITE: SiteContent = {
  announcement: {
    enabled: true,
    messages: [
      { id: "m1", text: "Fresh fits, daily", href: "/shop" },
      { id: "m2", text: "Easy returns", href: "/pages/returns-and-refunds" },
      { id: "m3", text: "Secure checkout", href: "" },
      { id: "m4", text: `Curated in ${contact.city}`, href: "/pages/about-us" },
    ],
  },
  hero: {
    kicker: "Tonight · World premiere",
    titleTop: "House of",
    titleBottom: "Bollywood",
    starring: "main character energy",
    ctaLabel: "Shop the fit",
    ctaHref: "/shop",
    finaleTitle: "You.",
    reelSource: "mix",
  },
  sections: HOME_SECTIONS.map((id) => ({ id, visible: true })),
  footer: {
    headline: "Dress like the",
    highlight: "scene is yours.",
    blurb: `The wardrobe is open. Graphic tees, shirts, denim, and trousers from ${contact.city}.`,
    newsletter: "A note when something new is placed.",
  },
};

export type ContentPage = {
  id: string;
  title: string;
  slug: string;
  body: string;
  status: PageStatus;
  seoTitle: string;
  seoDescription: string;
  updatedDaysAgo: number;
};

const PAGES: ContentPage[] = [
  {
    id: "about-us",
    title: "About us",
    slug: "about-us",
    status: "published",
    seoTitle: `About ${siteConfig.name}`,
    seoDescription: `A ${contact.city} store hand-picking graphic tees, shirts, denim and trousers for people who dress like it's their scene.`,
    updatedDaysAgo: 34,
    body: `## Hand-picked in ${contact.city}

${siteConfig.name} started as a small counter of graphic tees and grew into a wardrobe for anyone who dresses like the scene is theirs. Every piece is chosen by hand, a few at a time, so the racks stay fresh and nobody walks out in the same fit.

## What we stock

- Oversized graphic tees with bold prints
- Plaid, embroidered and pinstripe shirts
- Denim in every wash, from jet black to acid
- Easy, tapered trousers

## Say hello

Visit us in ${contact.city}, call ${contact.phoneDisplay} or write to ${contact.email}. We reply to every message.`,
  },
  {
    id: "returns-and-refunds",
    title: "Returns & refunds",
    slug: "returns-and-refunds",
    status: "published",
    seoTitle: "Returns & refunds",
    seoDescription: "Return unworn items within 7 days of delivery. Refunds go back to your original payment method within 5–7 working days.",
    updatedDaysAgo: 12,
    body: `## 7-day returns

If something doesn't fit or isn't what you expected, you can return it within 7 days of delivery. Items must be unworn, unwashed and have their tags attached.

## How to start a return

- Open your order from My account and choose Return
- Pick a reason and we'll arrange a pickup
- Pack the item in its original bag

## Refunds

Once the item reaches us and passes a quick check, we refund you within 5–7 working days. Prepaid orders go back to the original payment method. Cash on delivery orders are refunded by bank transfer.

### Exchanges

Need a different size? Choose Exchange instead of Return and we'll ship the new size as soon as the pickup is done, subject to stock.`,
  },
  {
    id: "shipping",
    title: "Shipping & delivery",
    slug: "shipping-and-delivery",
    status: "draft",
    seoTitle: "Shipping & delivery",
    seoDescription: "Free shipping on orders over ₹999. Most orders reach you in 3–6 working days.",
    updatedDaysAgo: 2,
    body: `## Delivery times

Orders are packed within 24 hours on working days. Most deliveries arrive in 3–6 working days depending on your pincode.

## Shipping charges

- Free on orders of ₹999 or more
- ₹79 on smaller orders

## Tracking

You'll get an SMS and email with your tracking number as soon as your order leaves the store.`,
  },
  {
    id: "privacy-policy",
    title: "Privacy policy",
    slug: "privacy-policy",
    status: "published",
    seoTitle: "Privacy policy",
    seoDescription: `How ${siteConfig.name} collects, uses and protects your personal information.`,
    updatedDaysAgo: 88,
    body: `## What we collect

We collect the details you give us when you place an order or create an account: your name, phone number, email and delivery address. Payments are handled by our payment partners; we never see or store your full card details.

## How we use it

- To deliver your orders and keep you updated
- To answer your questions
- To send offers, only if you've agreed to receive them

## Your choices

You can ask us to update or delete your information at any time by writing to ${contact.email}.`,
  },
  {
    id: "terms",
    title: "Terms & conditions",
    slug: "terms-and-conditions",
    status: "published",
    seoTitle: "Terms & conditions",
    seoDescription: `The terms that apply when you shop with ${siteConfig.name}.`,
    updatedDaysAgo: 88,
    body: `## Using this store

By placing an order you agree to these terms. We may update them from time to time; the version on this page applies to your order.

## Prices and stock

Prices include GST. We do our best to keep stock accurate, but if an item sells out after you order, we'll let you know and refund you in full.

## Contact

Questions about these terms? Write to ${contact.email}.`,
  },
];

export function getSiteContent(): SiteContent {
  return structuredClone(SITE);
}

export function getPages(): ContentPage[] {
  return PAGES.map((page) => ({ ...page }));
}

export function getPage(id: string) {
  return getPages().find((page) => page.id === id);
}

export type PageFormValues = Omit<ContentPage, "id" | "updatedDaysAgo"> & { id: string | null };

export function toPageFormValues(page?: ContentPage): PageFormValues {
  return {
    id: page?.id ?? null,
    title: page?.title ?? "",
    slug: page?.slug ?? "",
    body: page?.body ?? "",
    status: page?.status ?? "draft",
    seoTitle: page?.seoTitle ?? "",
    seoDescription: page?.seoDescription ?? "",
  };
}

// Writes ---------------------------------------------------------------------

export type PageInput = Omit<ContentPage, "id" | "updatedDaysAgo">;

/**
 * The single place content writes go through. Content is sample data for now,
 * so these report `persisted: false`; replace the bodies with database calls.
 */
export const contentStore = {
  async saveSite(content: SiteContent): Promise<{ persisted: boolean }> {
    void content;
    return { persisted: false };
  },
  async savePage(id: string | null, input: PageInput): Promise<{ persisted: boolean }> {
    void id;
    void input;
    return { persisted: false };
  },
  async removePage(id: string): Promise<{ persisted: boolean }> {
    void id;
    return { persisted: false };
  },
};
