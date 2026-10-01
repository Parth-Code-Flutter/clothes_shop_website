import { formatMoney } from "@/features/admin/lib/format";

/** Collection shapes shared by the server data, the actions and the editor. */

export const COLLECTION_KINDS = ["manual", "smart"] as const;
export type CollectionKind = (typeof COLLECTION_KINDS)[number];

export const COLLECTION_SORTS = ["manual", "best", "newest", "price-asc", "price-desc", "name"] as const;
export type CollectionSort = (typeof COLLECTION_SORTS)[number];

export const SORT_LABELS: Record<CollectionSort, string> = {
  manual: "Manual order",
  best: "Best selling",
  newest: "Newest first",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
  name: "Name, A to Z",
};

export const CONDITION_FIELDS = ["category", "price", "color", "tag"] as const;
export type ConditionField = (typeof CONDITION_FIELDS)[number];

export const CONDITION_OPS = ["is", "is_not", "lt", "gt", "contains"] as const;
export type ConditionOp = (typeof CONDITION_OPS)[number];

export const TAGS = ["new", "on_offer", "in_stock", "low_stock"] as const;
export type Tag = (typeof TAGS)[number];

export const TAG_LABELS: Record<Tag, string> = { new: "New", on_offer: "On offer", in_stock: "In stock", low_stock: "Low stock" };

/** Which operators each field allows; the first is the default. */
export const FIELD_META: Record<ConditionField, { label: string; ops: ConditionOp[] }> = {
  category: { label: "Category", ops: ["is", "is_not"] },
  price: { label: "Price", ops: ["lt", "gt"] },
  color: { label: "Colour", ops: ["contains", "is"] },
  tag: { label: "Tag", ops: ["is", "is_not"] },
};

export const OP_LABELS: Record<ConditionOp, string> = { is: "is", is_not: "is not", lt: "is under", gt: "is over", contains: "contains" };

/** `value` is a category id, rupees for price, free text for colour, or a tag. */
export type Condition = { field: ConditionField; op: ConditionOp; value: string };
export type CollectionRules = { match: "all" | "any"; conditions: Condition[] };

/** The product facts rules and sorting need. Safe to send to the browser. */
export type RuleProduct = {
  id: string;
  name: string;
  image: string;
  categoryId: string;
  categoryName: string;
  pricePaise: number;
  color: string;
  isNew: boolean;
  onOffer: boolean;
  inStock: boolean;
  lowStock: boolean;
  popularity: number;
  /** Position in the catalogue; lower is newer for the sample data. */
  order: number;
};

const TAG_TEST: Record<Tag, (product: RuleProduct) => boolean> = {
  new: (product) => product.isNew,
  on_offer: (product) => product.onOffer,
  in_stock: (product) => product.inStock,
  low_stock: (product) => product.lowStock,
};

function test(product: RuleProduct, condition: Condition) {
  const { field, op, value } = condition;
  if (field === "category") return op === "is_not" ? product.categoryId !== value : product.categoryId === value;
  if (field === "price") {
    const paise = Math.round(Number(value) * 100);
    if (!Number.isFinite(paise)) return false;
    return op === "gt" ? product.pricePaise > paise : product.pricePaise < paise;
  }
  if (field === "color") {
    const needle = value.trim().toLowerCase();
    const color = product.color.toLowerCase();
    return op === "is" ? color === needle : Boolean(needle) && color.includes(needle);
  }
  const check = TAG_TEST[value as Tag];
  if (!check) return false;
  return op === "is_not" ? !check(product) : check(product);
}

export function matchesRules(product: RuleProduct, rules: CollectionRules) {
  if (rules.conditions.length === 0) return false;
  return rules.match === "any" ? rules.conditions.some((condition) => test(product, condition)) : rules.conditions.every((condition) => test(product, condition));
}

const SORTERS: Record<Exclude<CollectionSort, "manual">, (a: RuleProduct, b: RuleProduct) => number> = {
  best: (a, b) => b.popularity - a.popularity,
  newest: (a, b) => Number(b.isNew) - Number(a.isNew) || a.order - b.order,
  "price-asc": (a, b) => a.pricePaise - b.pricePaise,
  "price-desc": (a, b) => b.pricePaise - a.pricePaise,
  name: (a, b) => a.name.localeCompare(b.name),
};

/** Products in the collection, in the order shoppers see them. */
export function resolveProducts(
  collection: { kind: CollectionKind; productIds: string[]; rules: CollectionRules; sort: CollectionSort },
  products: RuleProduct[],
) {
  const byId = new Map(products.map((product) => [product.id, product]));
  const members =
    collection.kind === "manual"
      ? collection.productIds.map((id) => byId.get(id)).filter((product): product is RuleProduct => Boolean(product))
      : products.filter((product) => matchesRules(product, collection.rules));
  if (collection.sort === "manual") return members;
  return [...members].sort(SORTERS[collection.sort]);
}

export function describeCondition(condition: Condition, categoryNames: Record<string, string>) {
  const field = FIELD_META[condition.field].label;
  const value =
    condition.field === "category"
      ? (categoryNames[condition.value] ?? condition.value)
      : condition.field === "price"
        ? formatMoney(Math.round(Number(condition.value) * 100) || 0)
        : condition.field === "tag"
          ? (TAG_LABELS[condition.value as Tag] ?? condition.value)
          : `“${condition.value}”`;
  return `${field} ${OP_LABELS[condition.op]} ${value}`;
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
