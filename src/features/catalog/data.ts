import type { CatalogCategory, CatalogProduct } from "./types";

const TOPS = ["S", "M", "L", "XL"];
const BOTTOMS = ["30", "32", "34", "36"];

function piece(
  product: Omit<CatalogProduct, "gallery" | "sourceUrl"> & { gallery?: string[] },
): CatalogProduct {
  return {
    ...product,
    gallery: product.gallery ?? [product.image],
    sourceUrl: "/shop",
  };
}

export const catalogCategories: CatalogCategory[] = [
  {
    id: "shirts",
    name: "Shirts",
    slug: "shirts",
    description: "Poplin, oxford, and linen shirts cut for an easy shoulder.",
    image: "/images/catalog/shirt-ivory.jpg",
    available: true,
  },
  {
    id: "t-shirts",
    name: "T-Shirts",
    slug: "t-shirts",
    description: "Heavy tees in studio colours. The everyday layer.",
    image: "/images/catalog/tee-white.jpg",
    available: true,
  },
  {
    id: "jeans",
    name: "Jeans",
    slug: "jeans",
    description: "Straight, slim, and relaxed denim.",
    image: "/images/catalog/jean-wash.jpg",
    available: true,
  },
  {
    id: "trousers",
    name: "Trousers",
    slug: "trousers",
    description: "Pleats, chinos, and dress trousers.",
    image: "/images/catalog/trouser-taupe.jpg",
    available: true,
  },
  {
    id: "jackets",
    name: "Jackets",
    slug: "jackets",
    description: "Outer layers for the cooler hour.",
    image: "/images/catalog/jacket-suede.jpg",
    available: true,
  },
];

export const catalogProducts: CatalogProduct[] = [
  piece({
    id: "ivory-poplin-shirt",
    name: "Ivory Poplin Shirt",
    slug: "ivory-poplin-shirt",
    categoryId: "shirts",
    image: "/images/catalog/shirt-ivory.jpg",
    alt: "Ivory poplin shirt on a hanger",
    pricePaise: 189900,
    mrpPaise: 249900,
    sizes: TOPS,
    summary: "A clean poplin shirt with a soft collar. Sample piece for the wardrobe edit.",
  }),
  piece({
    id: "indigo-oxford-shirt",
    name: "Indigo Oxford Shirt",
    slug: "indigo-oxford-shirt",
    categoryId: "shirts",
    image: "/images/catalog/shirt-indigo.jpg",
    alt: "Indigo oxford shirt",
    pricePaise: 219900,
    mrpPaise: 279900,
    sizes: TOPS,
    summary: "Oxford cloth in a deep indigo. Buttoned cuff, relaxed through the body.",
  }),
  piece({
    id: "sand-linen-shirt",
    name: "Sand Linen Shirt",
    slug: "sand-linen-shirt",
    categoryId: "shirts",
    image: "/images/catalog/shirt-linen.jpg",
    alt: "Sand linen shirt",
    pricePaise: 249900,
    mrpPaise: 299900,
    sizes: TOPS,
    summary: "Washed linen in sand. Meant to crease. Worn open or tucked.",
  }),
  piece({
    id: "black-evening-shirt",
    name: "Black Evening Shirt",
    slug: "black-evening-shirt",
    categoryId: "shirts",
    image: "/images/catalog/shirt-black.jpg",
    alt: "Black evening shirt",
    pricePaise: 279900,
    mrpPaise: 329900,
    sizes: TOPS,
    summary: "A black shirt with a sharper collar for after dark.",
  }),
  piece({
    id: "studio-white-tee",
    name: "Studio White Tee",
    slug: "studio-white-tee",
    categoryId: "t-shirts",
    image: "/images/catalog/tee-white.jpg",
    alt: "White studio t-shirt",
    pricePaise: 79900,
    mrpPaise: 99900,
    sizes: TOPS,
    summary: "Heavy cotton tee in optic white. The base layer of the house.",
  }),
  piece({
    id: "ink-black-tee",
    name: "Ink Black Tee",
    slug: "ink-black-tee",
    categoryId: "t-shirts",
    image: "/images/catalog/tee-black.jpg",
    alt: "Black t-shirt",
    pricePaise: 79900,
    mrpPaise: 99900,
    sizes: TOPS,
    summary: "Ink black cotton with a ribbed neck. Cut close through the chest.",
  }),
  piece({
    id: "stone-heavy-tee",
    name: "Stone Heavy Tee",
    slug: "stone-heavy-tee",
    categoryId: "t-shirts",
    image: "/images/catalog/tee-stone.jpg",
    alt: "Stone coloured heavy t-shirt",
    pricePaise: 99900,
    mrpPaise: 129900,
    sizes: TOPS,
    summary: "A heavier jersey in stone. Slightly longer hem.",
  }),
  piece({
    id: "olive-box-tee",
    name: "Olive Box Tee",
    slug: "olive-box-tee",
    categoryId: "t-shirts",
    image: "/images/catalog/tee-olive.jpg",
    alt: "Olive boxy t-shirt",
    pricePaise: 109900,
    mrpPaise: 139900,
    sizes: TOPS,
    summary: "Boxy olive tee. Dropped shoulder, quiet colour.",
  }),
  piece({
    id: "midnight-straight-jeans",
    name: "Midnight Straight Jeans",
    slug: "midnight-straight-jeans",
    categoryId: "jeans",
    image: "/images/catalog/jean-midnight.jpg",
    alt: "Dark straight jeans",
    pricePaise: 249900,
    mrpPaise: 319900,
    sizes: BOTTOMS,
    summary: "Straight leg in a near-black wash. Clean pocket, no whiskering.",
  }),
  piece({
    id: "washed-slim-jeans",
    name: "Washed Slim Jeans",
    slug: "washed-slim-jeans",
    categoryId: "jeans",
    image: "/images/catalog/jean-wash.jpg",
    alt: "Washed blue slim jeans",
    pricePaise: 229900,
    mrpPaise: 289900,
    sizes: BOTTOMS,
    summary: "A mid-blue slim jean with a soft wash.",
  }),
  piece({
    id: "ecru-relaxed-jeans",
    name: "Ecru Relaxed Jeans",
    slug: "ecru-relaxed-jeans",
    categoryId: "jeans",
    image: "/images/catalog/jean-ecru.jpg",
    alt: "Ecru relaxed jeans",
    pricePaise: 269900,
    mrpPaise: 329900,
    sizes: BOTTOMS,
    summary: "Relaxed ecru denim. Wider through the thigh, cropped at the ankle.",
  }),
  piece({
    id: "black-clean-jeans",
    name: "Black Clean Jeans",
    slug: "black-clean-jeans",
    categoryId: "jeans",
    image: "/images/catalog/jean-black.jpg",
    alt: "Black clean jeans",
    pricePaise: 259900,
    mrpPaise: 309900,
    sizes: BOTTOMS,
    summary: "Black denim with a clean front. Dress it with a shirt or a tee.",
  }),
  piece({
    id: "taupe-pleat-trouser",
    name: "Taupe Pleat Trouser",
    slug: "taupe-pleat-trouser",
    categoryId: "trousers",
    image: "/images/catalog/trouser-taupe.jpg",
    alt: "Taupe pleated trousers",
    pricePaise: 219900,
    mrpPaise: 279900,
    sizes: BOTTOMS,
    summary: "Single pleat in taupe. A softer dress trouser.",
  }),
  piece({
    id: "charcoal-wool-trouser",
    name: "Charcoal Wool Trouser",
    slug: "charcoal-wool-trouser",
    categoryId: "trousers",
    image: "/images/catalog/trouser-charcoal.jpg",
    alt: "Charcoal wool trousers",
    pricePaise: 289900,
    mrpPaise: 349900,
    sizes: BOTTOMS,
    summary: "Charcoal wool blend with a pressed crease.",
  }),
  piece({
    id: "stone-chino",
    name: "Stone Chino",
    slug: "stone-chino",
    categoryId: "trousers",
    image: "/images/catalog/trouser-chino.jpg",
    alt: "Stone chinos",
    pricePaise: 179900,
    mrpPaise: 229900,
    sizes: BOTTOMS,
    summary: "Cotton chino in stone. The weekday trouser.",
  }),
  piece({
    id: "navy-dress-trouser",
    name: "Navy Dress Trouser",
    slug: "navy-dress-trouser",
    categoryId: "trousers",
    image: "/images/catalog/trouser-navy.jpg",
    alt: "Navy dress trousers",
    pricePaise: 249900,
    mrpPaise: 299900,
    sizes: BOTTOMS,
    summary: "Navy dress trouser with a slim straight leg.",
  }),
  piece({
    id: "tobacco-suede-jacket",
    name: "Tobacco Suede Jacket",
    slug: "tobacco-suede-jacket",
    categoryId: "jackets",
    image: "/images/catalog/jacket-suede.jpg",
    alt: "Tobacco suede jacket",
    pricePaise: 599900,
    mrpPaise: 749900,
    sizes: TOPS,
    summary: "Tobacco suede with a notched collar. The statement layer.",
  }),
  piece({
    id: "black-bomber",
    name: "Black Bomber",
    slug: "black-bomber",
    categoryId: "jackets",
    image: "/images/catalog/jacket-bomber.jpg",
    alt: "Black bomber jacket",
    pricePaise: 449900,
    mrpPaise: 549900,
    sizes: TOPS,
    summary: "A black bomber with a ribbed cuff. Light enough for the evening.",
  }),
  piece({
    id: "camel-overshirt",
    name: "Camel Overshirt",
    slug: "camel-overshirt",
    categoryId: "jackets",
    image: "/images/catalog/jacket-camel.jpg",
    alt: "Camel overshirt jacket",
    pricePaise: 349900,
    mrpPaise: 429900,
    sizes: TOPS,
    summary: "Camel overshirt worn open over a tee. Shirt weight, jacket presence.",
  }),
  piece({
    id: "ivory-coach-jacket",
    name: "Ivory Coach Jacket",
    slug: "ivory-coach-jacket",
    categoryId: "jackets",
    image: "/images/catalog/jacket-coach.jpg",
    alt: "Ivory coach jacket",
    pricePaise: 499900,
    mrpPaise: 599900,
    sizes: TOPS,
    summary: "Ivory coach jacket with a snap front. Easy over denim.",
  }),
];

export function getAllCategories() {
  return catalogCategories;
}

export function getCategoryById(id: string) {
  return catalogCategories.find((category) => category.id === id);
}

export function getCategoryBySlug(slug: string) {
  return catalogCategories.find((category) => category.slug === slug);
}

export function getAllProducts() {
  return catalogProducts;
}

export function getProductsByCategory(categoryId: string) {
  return catalogProducts.filter((product) => product.categoryId === categoryId);
}

export function getProductBySlug(slug: string) {
  return catalogProducts.find((product) => product.slug === slug);
}

export function getProductSlugs() {
  return catalogProducts.map((product) => product.slug);
}
