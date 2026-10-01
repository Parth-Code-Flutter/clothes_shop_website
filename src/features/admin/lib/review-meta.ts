/** Review labels shared by the server data, the actions and the moderation UI. */

export const REVIEW_STATUSES = ["pending", "published", "hidden"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const REVIEW_STATUS_META: Record<ReviewStatus, { label: string; className: string }> = {
  pending: { label: "Awaiting approval", className: "bg-adm-warning-soft text-adm-warning" },
  published: { label: "Published", className: "bg-adm-success-soft text-adm-success" },
  hidden: { label: "Hidden", className: "bg-adm-surface-muted text-adm-ink-faint" },
};

export type ReviewFit = "small" | "true" | "large";
export const FIT_LABELS: Record<ReviewFit, string> = { small: "Runs small", true: "True to size", large: "Runs large" };

export type ReviewFlag = "contact" | "low_rating" | "returned" | "unverified";
export const FLAG_META: Record<ReviewFlag, { label: string; hint: string; className: string }> = {
  contact: { label: "Contains contact details", hint: "Links, emails or phone numbers are often spam", className: "bg-adm-danger-soft text-adm-danger" },
  low_rating: { label: "Low rating", hint: "A quick, kind reply helps", className: "bg-adm-warning-soft text-adm-warning" },
  returned: { label: "Item returned", hint: "The customer returned this order", className: "bg-adm-info-soft text-adm-info" },
  unverified: { label: "Not a verified buyer", hint: "No matching order", className: "bg-adm-surface-muted text-adm-ink-soft" },
};

export const REPLY_MAX = 1000;

const CONTACT = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|in|net|org|co|shop|store)\b|@[a-z0-9-]+\.[a-z]{2,}|(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5})/i;

export function hasContactDetails(text: string) {
  return CONTACT.test(text);
}
