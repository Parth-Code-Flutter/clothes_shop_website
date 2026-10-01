"use server";

import { requireAdmin } from "@/features/admin/auth/dal";
import { getCollections } from "@/features/admin/data/collections";
import { contentStore, getPage, getPages, type PageInput } from "@/features/admin/data/content";
import { CONTENT_LIMITS, HOME_SECTIONS, PAGE_LIMITS, PAGE_STATUSES, isValidLink, type PageStatus, type SiteContent } from "@/features/admin/lib/content-meta";
import { SLUG_PATTERN } from "@/features/admin/lib/slug";

export type ContentFormState = {
  status: "idle" | "saved" | "preview" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  at?: number;
};

const PREVIEW_NOTE = "Saving switches on once the content database is connected.";

function invalid(fieldErrors: Record<string, string>): ContentFormState {
  return { status: "error", message: "Fix the highlighted fields and save again.", fieldErrors, at: Date.now() };
}

export async function saveSiteContentAction(_previous: ContentFormState, formData: FormData): Promise<ContentFormState> {
  await requireAdmin();
  let data: Partial<SiteContent>;
  try {
    data = JSON.parse(String(formData.get("content") ?? "{}"));
  } catch {
    return { status: "error", message: "Something went wrong reading the form. Reload and try again.", at: Date.now() };
  }

  const errors: Record<string, string> = {};
  const text = (value: unknown, key: string, label: string, max: number, required = true) => {
    const clean = String(value ?? "").trim();
    if (required && !clean) errors[key] = `${label} can't be empty.`;
    else if (clean.length > max) errors[key] = `Keep ${label.toLowerCase()} under ${max} characters.`;
    return clean.slice(0, max);
  };

  const rawMessages = Array.isArray(data.announcement?.messages) ? data.announcement.messages.slice(0, CONTENT_LIMITS.messages) : [];
  const messages = rawMessages.map((message, index) => {
    const clean = text(message?.text, `message.${index}`, "Message", CONTENT_LIMITS.message);
    const href = String(message?.href ?? "").trim();
    if (href && !isValidLink(href)) errors[`message.${index}`] = "Links must start with / or https://.";
    return { id: String(message?.id ?? `m${index}`).slice(0, 20), text: clean, href };
  });
  const enabled = Boolean(data.announcement?.enabled);
  if (enabled && messages.length === 0) errors.messages = "Add a message, or turn the bar off.";

  const hero = data.hero ?? ({} as SiteContent["hero"]);
  const ctaHref = String(hero.ctaHref ?? "").trim();
  if (!isValidLink(ctaHref)) errors["hero.ctaHref"] = "Links must start with / or https://.";
  const reelSource = String(hero.reelSource ?? "mix");
  if (reelSource !== "mix" && !getCollections().some((collection) => collection.id === reelSource)) errors["hero.reelSource"] = "Choose a collection that still exists.";

  const sectionIds = Array.isArray(data.sections) ? data.sections.map((section) => section?.id) : [];
  const sectionsValid = sectionIds.length === HOME_SECTIONS.length && HOME_SECTIONS.every((id) => sectionIds.includes(id));
  if (!sectionsValid) errors.sections = "The homepage sections are out of date. Reload and try again.";
  const sections = sectionsValid ? data.sections!.map((section) => ({ id: section.id, visible: Boolean(section.visible) })) : [];
  if (sectionsValid && !sections.some((section) => section.visible)) errors.sections = "Keep at least one homepage section visible.";

  const footer = data.footer ?? ({} as SiteContent["footer"]);
  const content: SiteContent = {
    announcement: { enabled, messages },
    hero: {
      kicker: text(hero.kicker, "hero.kicker", "Kicker", CONTENT_LIMITS.kicker, false),
      titleTop: text(hero.titleTop, "hero.titleTop", "First title line", CONTENT_LIMITS.title),
      titleBottom: text(hero.titleBottom, "hero.titleBottom", "Second title line", CONTENT_LIMITS.title),
      starring: text(hero.starring, "hero.starring", "Starring line", CONTENT_LIMITS.starring, false),
      ctaLabel: text(hero.ctaLabel, "hero.ctaLabel", "Button text", CONTENT_LIMITS.ctaLabel),
      ctaHref,
      finaleTitle: text(hero.finaleTitle, "hero.finaleTitle", "Finale line", CONTENT_LIMITS.finaleTitle),
      reelSource,
    },
    sections,
    footer: {
      headline: text(footer.headline, "footer.headline", "Headline", CONTENT_LIMITS.headline),
      highlight: text(footer.highlight, "footer.highlight", "Highlighted words", CONTENT_LIMITS.highlight, false),
      blurb: text(footer.blurb, "footer.blurb", "Description", CONTENT_LIMITS.blurb, false),
      newsletter: text(footer.newsletter, "footer.newsletter", "Sign-up note", CONTENT_LIMITS.newsletter, false),
    },
  };

  if (Object.keys(errors).length > 0) return invalid(errors);
  const result = await contentStore.saveSite(content);
  return result.persisted
    ? { status: "saved", message: "Storefront content updated.", at: Date.now() }
    : { status: "preview", message: `Everything checks out. ${PREVIEW_NOTE}`, at: Date.now() };
}

export async function savePageAction(_previous: ContentFormState, formData: FormData): Promise<ContentFormState> {
  await requireAdmin();
  const read = (key: string) => String(formData.get(key) ?? "").trim();
  const id = read("id") || null;
  const errors: Record<string, string> = {};

  const title = read("title");
  if (title.length < 2) errors.title = "Give the page a title.";
  else if (title.length > PAGE_LIMITS.title) errors.title = `Keep the title under ${PAGE_LIMITS.title} characters.`;

  const slug = read("slug");
  if (!SLUG_PATTERN.test(slug) || slug.length > 60) errors.slug = "Use lowercase letters, numbers and single hyphens.";
  else if (getPages().some((page) => page.slug === slug && page.id !== id)) errors.slug = "Another page already uses this URL.";

  const body = String(formData.get("body") ?? "").replace(/\r\n/g, "\n").trim();
  const status = read("status") as PageStatus;
  if (!PAGE_STATUSES.includes(status)) errors.status = "Choose published or draft.";
  if (body.length > PAGE_LIMITS.body) errors.body = `Keep the page under ${PAGE_LIMITS.body.toLocaleString("en-IN")} characters.`;
  else if (status === "published" && body.length < 20) errors.body = "Write the page before publishing it, or save it as a draft.";

  const seoTitle = read("seoTitle");
  if (seoTitle.length > PAGE_LIMITS.seoTitle) errors.seoTitle = `Search engines cut titles after about ${PAGE_LIMITS.seoTitle} characters.`;
  const seoDescription = read("seoDescription");
  if (seoDescription.length > PAGE_LIMITS.seoDescription) errors.seoDescription = `Search engines cut descriptions after about ${PAGE_LIMITS.seoDescription} characters.`;

  if (Object.keys(errors).length > 0) return invalid(errors);
  const input: PageInput = { title, slug, body, status, seoTitle, seoDescription };
  const result = await contentStore.savePage(id, input);
  return result.persisted
    ? { status: "saved", message: id ? `${title} updated.` : `${title} created.`, at: Date.now() }
    : { status: "preview", message: `Everything checks out. ${PREVIEW_NOTE}`, at: Date.now() };
}

export async function deletePageAction(id: string): Promise<{ ok: boolean; persisted: boolean; message: string }> {
  await requireAdmin();
  const page = getPage(id);
  if (!page) return { ok: false, persisted: false, message: "That page no longer exists." };
  const result = await contentStore.removePage(page.id);
  return { ok: true, persisted: result.persisted, message: result.persisted ? `${page.title} deleted.` : `${page.title} would be deleted. ${PREVIEW_NOTE}` };
}
