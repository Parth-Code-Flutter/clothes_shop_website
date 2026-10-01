"use server";

import { requireAdmin } from "@/features/admin/auth/dal";
import { collectionStore, getCollection, getCollections, getRuleProducts, type CollectionInput } from "@/features/admin/data/collections";
import { getProductCategories } from "@/features/admin/data/products";
import {
  COLLECTION_KINDS,
  COLLECTION_SORTS,
  CONDITION_FIELDS,
  FIELD_META,
  TAGS,
  type CollectionKind,
  type CollectionRules,
  type CollectionSort,
  type Condition,
  type Tag,
} from "@/features/admin/lib/collection-rules";
import { SLUG_PATTERN } from "@/features/admin/lib/slug";

export type CollectionFormState = {
  status: "idle" | "saved" | "preview" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  at?: number;
};

const PREVIEW_NOTE = "Saving switches on once the collections database is connected.";
const MAX_CONDITIONS = 10;

function parseRules(raw: string, categoryIds: Set<string>): { rules: CollectionRules; error?: string } {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { rules: { match: "all", conditions: [] }, error: "Add at least one condition." };
  }
  const input = (data ?? {}) as { match?: unknown; conditions?: unknown };
  const match = input.match === "any" ? "any" : "all";
  const list = Array.isArray(input.conditions) ? input.conditions.slice(0, MAX_CONDITIONS) : [];
  const conditions: Condition[] = [];

  for (const item of list) {
    const { field, op, value } = (item ?? {}) as Record<string, unknown>;
    if (typeof field !== "string" || !CONDITION_FIELDS.includes(field as Condition["field"])) return { rules: { match, conditions }, error: "One of the conditions has an unknown field." };
    const meta = FIELD_META[field as Condition["field"]];
    if (typeof op !== "string" || !meta.ops.includes(op as Condition["op"])) return { rules: { match, conditions }, error: `Choose how to compare ${meta.label.toLowerCase()}.` };
    const text = String(value ?? "").trim().slice(0, 40);
    if (field === "category" && !categoryIds.has(text)) return { rules: { match, conditions }, error: "Choose a category for each category condition." };
    if (field === "price" && !(Number(text) > 0)) return { rules: { match, conditions }, error: "Enter a price above ₹0 for each price condition." };
    if (field === "color" && !text) return { rules: { match, conditions }, error: "Enter a colour for each colour condition." };
    if (field === "tag" && !TAGS.includes(text as Tag)) return { rules: { match, conditions }, error: "Choose a tag for each tag condition." };
    conditions.push({ field: field as Condition["field"], op: op as Condition["op"], value: text });
  }

  if (conditions.length === 0) return { rules: { match, conditions }, error: "Add at least one condition." };
  return { rules: { match, conditions } };
}

export async function saveCollectionAction(_previous: CollectionFormState, formData: FormData): Promise<CollectionFormState> {
  await requireAdmin();
  const text = (key: string, max = 80) => String(formData.get(key) ?? "").trim().slice(0, max);
  const id = text("id") || null;
  const errors: Record<string, string> = {};

  const title = text("title");
  if (title.length < 2) errors.title = "Give the collection a name.";

  const slug = text("slug", 60);
  if (!SLUG_PATTERN.test(slug)) errors.slug = "Use lowercase letters, numbers and single hyphens.";
  else if (getCollections().some((collection) => collection.slug === slug && collection.id !== id)) errors.slug = "Another collection already uses this URL.";

  const description = String(formData.get("description") ?? "").trim();
  if (description.length > 500) errors.description = "Keep the description under 500 characters.";

  const kind = text("kind") as CollectionKind;
  if (!COLLECTION_KINDS.includes(kind)) errors.kind = "Choose how products are added.";

  const sort = text("sort") as CollectionSort;
  if (!COLLECTION_SORTS.includes(sort) || (kind === "smart" && sort === "manual")) errors.sort = "Choose a sort order.";

  const published = formData.get("published") === "on";
  const known = new Set(getRuleProducts().map((product) => product.id));

  let productIds: string[] = [];
  let rules: CollectionRules = { match: "all", conditions: [] };
  if (kind === "manual") {
    productIds = [...new Set(formData.getAll("productIds").map(String))].filter((productId) => known.has(productId)).slice(0, 500);
    if (published && productIds.length === 0) errors.productIds = "Add at least one product, or keep the collection hidden.";
  } else if (kind === "smart") {
    const parsed = parseRules(String(formData.get("rules") ?? ""), new Set(getProductCategories().map((category) => category.id)));
    rules = parsed.rules;
    if (parsed.error) errors.rules = parsed.error;
  }

  const coverText = text("coverProductId");
  const coverProductId = coverText && known.has(coverText) ? coverText : null;

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields and save again.", fieldErrors: errors, at: Date.now() };
  }

  const input: CollectionInput = { title, slug, description, kind, productIds, rules, sort, published, coverProductId };
  const result = await collectionStore.save(id, input);
  return result.persisted
    ? { status: "saved", message: id ? `${title} updated.` : `${title} created.`, at: Date.now() }
    : { status: "preview", message: `Everything checks out. ${PREVIEW_NOTE}`, at: Date.now() };
}

export async function setCollectionPublishedAction(id: string, published: boolean): Promise<{ ok: boolean; persisted: boolean; message: string }> {
  await requireAdmin();
  const collection = getCollection(id);
  if (!collection) return { ok: false, persisted: false, message: "That collection no longer exists." };
  if (published && collection.products.length === 0) return { ok: false, persisted: false, message: `${collection.title} has no products yet, so it stays hidden.` };
  const result = await collectionStore.setPublished(collection.id, Boolean(published));
  const label = `${collection.title} ${published ? "is now visible in the store" : "is now hidden"}`;
  return { ok: true, persisted: result.persisted, message: result.persisted ? `${label}.` : `${label} (preview). ${PREVIEW_NOTE}` };
}

export async function deleteCollectionAction(id: string): Promise<{ ok: boolean; persisted: boolean; message: string }> {
  await requireAdmin();
  const collection = getCollection(id);
  if (!collection) return { ok: false, persisted: false, message: "That collection no longer exists." };
  const result = await collectionStore.remove(collection.id);
  return {
    ok: true,
    persisted: result.persisted,
    message: result.persisted ? `${collection.title} deleted. Its products are untouched.` : `${collection.title} would be deleted; its products stay. ${PREVIEW_NOTE}`,
  };
}
