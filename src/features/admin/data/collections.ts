import "server-only";
import { getAllCategories } from "@/features/catalog/data";
import { getAdminProducts } from "@/features/admin/data/products";
import { resolveProducts, type CollectionKind, type CollectionRules, type CollectionSort, type RuleProduct } from "@/features/admin/lib/collection-rules";

/**
 * SAMPLE collections built on the real catalogue. Manual collections list
 * product ids; smart ones keep their rules and are resolved against the
 * catalogue on every read. Writes go through `collectionStore`.
 */

export type Collection = {
  id: string;
  title: string;
  slug: string;
  description: string;
  kind: CollectionKind;
  /** Manual collections only, in display order. */
  productIds: string[];
  /** Smart collections only. */
  rules: CollectionRules;
  sort: CollectionSort;
  published: boolean;
  /** Product whose image is the cover; null means the first product. */
  coverProductId: string | null;
  updatedDaysAgo: number;
};

export type ResolvedCollection = Collection & { products: RuleProduct[]; cover: string | null };

const NO_RULES: CollectionRules = { match: "all", conditions: [] };

const SEEDS: Collection[] = [
  {
    id: "new-arrivals",
    title: "New Arrivals",
    slug: "new-arrivals",
    description: "The latest drops, updated automatically as new pieces land.",
    kind: "smart",
    productIds: [],
    rules: { match: "all", conditions: [{ field: "tag", op: "is", value: "new" }] },
    sort: "newest",
    published: true,
    coverProductId: null,
    updatedDaysAgo: 1,
  },
  {
    id: "marvel-universe",
    title: "Marvel Universe",
    slug: "marvel-universe",
    description: "Heroes, anti-heroes and villains, hand-picked from our graphic tees.",
    kind: "manual",
    productIds: [
      "venom-mustard-tee",
      "avengers-graffiti-tee",
      "hulk-smash-blue-tee",
      "hulk-rage-black-tee",
      "wakanda-forever-black-tee",
      "black-panther-ivory-tee",
      "deadpool-white-tee",
      "deadpool-ivory-tee",
      "wolverine-aqua-tee",
      "dr-doom-black-tee",
      "spider-emblem-beige-tee",
    ],
    rules: NO_RULES,
    sort: "manual",
    published: true,
    coverProductId: "avengers-graffiti-tee",
    updatedDaysAgo: 4,
  },
  {
    id: "under-999",
    title: "Under ₹999",
    slug: "under-999",
    description: "Everyday favourites that keep the bill small.",
    kind: "smart",
    productIds: [],
    rules: { match: "all", conditions: [{ field: "price", op: "lt", value: "999" }, { field: "tag", op: "is", value: "in_stock" }] },
    sort: "best",
    published: true,
    coverProductId: null,
    updatedDaysAgo: 9,
  },
  {
    id: "all-black",
    title: "All Black",
    slug: "all-black",
    description: "Black, washed black and jet black. Goes with everything.",
    kind: "smart",
    productIds: [],
    rules: { match: "all", conditions: [{ field: "color", op: "contains", value: "black" }] },
    sort: "best",
    published: true,
    coverProductId: null,
    updatedDaysAgo: 12,
  },
  {
    id: "bottoms",
    title: "Jeans & Trousers",
    slug: "jeans-and-trousers",
    description: "Denim and trousers in every fit, from skinny to relaxed.",
    kind: "smart",
    productIds: [],
    rules: {
      match: "any",
      conditions: [
        { field: "category", op: "is", value: "jeans" },
        { field: "category", op: "is", value: "trousers" },
      ],
    },
    sort: "price-asc",
    published: true,
    coverProductId: null,
    updatedDaysAgo: 20,
  },
  {
    id: "on-sale",
    title: "On Sale",
    slug: "sale",
    description: "Pieces with a compare-at price, while stock lasts.",
    kind: "smart",
    productIds: [],
    rules: { match: "all", conditions: [{ field: "tag", op: "is", value: "on_offer" }] },
    sort: "price-asc",
    published: true,
    coverProductId: null,
    updatedDaysAgo: 6,
  },
  {
    id: "sports-and-speed",
    title: "Sports & Speed",
    slug: "sports-and-speed",
    description: "Jersey-inspired tees for cricket, football, basketball and motorsport fans.",
    kind: "manual",
    productIds: ["dhoni-7-washed-black-tee", "messi-10-ivory-tee", "court-23-yellow-tee", "gt3-rs-orange-tee"],
    rules: NO_RULES,
    sort: "manual",
    published: true,
    coverProductId: null,
    updatedDaysAgo: 15,
  },
  {
    id: "festive-edit",
    title: "Festive Edit",
    slug: "festive-edit",
    description: "Embroidered shirts and smart trousers for the season of celebrations.",
    kind: "manual",
    productIds: ["floral-embroidered-taupe-shirt", "dragonfly-embroidered-black-shirt", "embroidered-plaid-flannel-shirt", "rust-twill-overshirt", "ivory-pleated-trousers"],
    rules: NO_RULES,
    sort: "manual",
    published: false,
    coverProductId: "floral-embroidered-taupe-shirt",
    updatedDaysAgo: 0,
  },
];

export function getRuleProducts(): RuleProduct[] {
  return getAdminProducts()
    .filter((product) => product.status !== "archived")
    .map((product, order) => ({
      id: product.id,
      name: product.name,
      image: product.image,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      pricePaise: product.pricePaise,
      color: product.color,
      isNew: product.isNew,
      onOffer: Boolean(product.mrpPaise && product.mrpPaise > product.pricePaise),
      inStock: product.stockState !== "out",
      lowStock: product.stockState === "low",
      popularity: product.popularity,
      order,
    }));
}

function resolve(collection: Collection, products: RuleProduct[]): ResolvedCollection {
  const members = resolveProducts(collection, products);
  const cover = (collection.coverProductId && products.find((product) => product.id === collection.coverProductId)?.image) || members[0]?.image || null;
  return { ...collection, products: members, cover };
}

export function getCollections(): ResolvedCollection[] {
  const products = getRuleProducts();
  return SEEDS.map((collection) => resolve(collection, products));
}

export function getCollection(id: string) {
  return getCollections().find((collection) => collection.id === id);
}

/** Catalogue categories with live product and stock counts. */
export function getCategorySummaries() {
  const products = getAdminProducts();
  return getAllCategories().map((category) => {
    const members = products.filter((product) => product.categoryId === category.id);
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      products: members.length,
      units: members.reduce((total, product) => total + product.totalStock, 0),
      soldOut: members.filter((product) => product.stockState === "out").length,
    };
  });
}

export type CollectionFormValues = {
  id: string | null;
  title: string;
  slug: string;
  description: string;
  kind: CollectionKind;
  productIds: string[];
  rules: CollectionRules;
  sort: CollectionSort;
  published: boolean;
  coverProductId: string | null;
};

export function toCollectionFormValues(collection?: Collection): CollectionFormValues {
  return {
    id: collection?.id ?? null,
    title: collection?.title ?? "",
    slug: collection?.slug ?? "",
    description: collection?.description ?? "",
    kind: collection?.kind ?? "manual",
    productIds: collection?.productIds ?? [],
    rules: collection?.rules ?? { match: "all", conditions: [{ field: "category", op: "is", value: "t-shirts" }] },
    sort: collection?.sort ?? "manual",
    published: collection?.published ?? false,
    coverProductId: collection?.coverProductId ?? null,
  };
}

// Writes ---------------------------------------------------------------------

export type CollectionInput = Omit<Collection, "id" | "updatedDaysAgo">;

/**
 * The single place collection writes go through. Collections are sample data
 * for now, so these report `persisted: false`; replace the bodies with database calls.
 */
export const collectionStore = {
  async save(id: string | null, input: CollectionInput): Promise<{ persisted: boolean }> {
    void id;
    void input;
    return { persisted: false };
  },
  async setPublished(id: string, published: boolean): Promise<{ persisted: boolean }> {
    void id;
    void published;
    return { persisted: false };
  },
  async remove(id: string): Promise<{ persisted: boolean }> {
    void id;
    return { persisted: false };
  },
};
