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
    description: "Oxford, poplin, and check. Worn, not posed.",
    image: "/images/catalog/shirt-ivory.jpg",
    available: true,
  },
  {
    id: "t-shirts",
    name: "T-Shirts",
    slug: "t-shirts",
    description: "Clean tees and hoodies. The everyday layer.",
    image: "/images/catalog/tee-white.jpg",
    available: true,
  },
  {
    id: "jeans",
    name: "Jeans",
    slug: "jeans",
    description: "Washed, relaxed, and dark denim.",
    image: "/images/catalog/jean-wash.jpg",
    available: true,
  },
  {
    id: "trousers",
    name: "Trousers",
    slug: "trousers",
    description: "Pleats and tailored trousers.",
    image: "/images/catalog/trouser-taupe.jpg",
    available: true,
  },
  {
    id: "jackets",
    name: "Jackets",
    slug: "jackets",
    description: "Leather, bombers, and coats.",
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
    name: "Sky Oxford Shirt",
    slug: "indigo-oxford-shirt",
    categoryId: "shirts",
    image: "/images/catalog/shirt-indigo.jpg",
    alt: "Light blue oxford shirt worn with a jacket",
    pricePaise: 219900,
    mrpPaise: 279900,
    sizes: TOPS,
    summary: "Light blue oxford, open at the collar, with a jacket over the shoulder.",
  }),
  piece({
    id: "sand-linen-shirt",
    name: "Coral Shirt",
    slug: "sand-linen-shirt",
    categoryId: "shirts",
    image: "/images/catalog/shirt-linen.jpg",
    alt: "Coral shirt hanging in a wardrobe",
    pricePaise: 249900,
    mrpPaise: 299900,
    sizes: TOPS,
    summary: "A coral shirt with a soft collar. Warm colour, easy cotton.",
  }),
  piece({
    id: "black-evening-shirt",
    name: "Check Shirt",
    slug: "black-evening-shirt",
    categoryId: "shirts",
    image: "/images/catalog/shirt-black.jpg",
    alt: "Blue check shirt",
    pricePaise: 279900,
    mrpPaise: 329900,
    sizes: TOPS,
    summary: "A blue check shirt, worn loose. The weekend shirt.",
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
    name: "Air Tee",
    slug: "ink-black-tee",
    categoryId: "t-shirts",
    image: "/images/catalog/tee-black.jpg",
    alt: "White cotton tee",
    pricePaise: 79900,
    mrpPaise: 99900,
    sizes: TOPS,
    summary: "A light cotton tee. Soft neck, easy through the body.",
  }),
  piece({
    id: "stone-heavy-tee",
    name: "Stone Hoodie",
    slug: "stone-heavy-tee",
    categoryId: "t-shirts",
    image: "/images/catalog/tee-stone.jpg",
    alt: "Stone grey hoodie",
    pricePaise: 99900,
    mrpPaise: 129900,
    sizes: TOPS,
    summary: "A stone hoodie with a kangaroo pocket. The off-duty layer.",
  }),
  piece({
    id: "olive-box-tee",
    name: "Mustard Hoodie",
    slug: "olive-box-tee",
    categoryId: "t-shirts",
    image: "/images/catalog/tee-olive.jpg",
    alt: "Mustard hoodie",
    pricePaise: 109900,
    mrpPaise: 139900,
    sizes: TOPS,
    summary: "Mustard hoodie, hood up. The colour of the season.",
  }),
  piece({
    id: "midnight-straight-jeans",
    name: "Midnight Straight Jeans",
    slug: "midnight-straight-jeans",
    categoryId: "jeans",
    image: "/images/catalog/jean-midnight.jpg",
    alt: "Folded denim from pale blue to midnight",
    pricePaise: 249900,
    mrpPaise: 319900,
    sizes: BOTTOMS,
    summary: "Dark denim in a straight leg, shown beside the lighter washes.",
  }),
  piece({
    id: "washed-slim-jeans",
    name: "Washed Slim Jeans",
    slug: "washed-slim-jeans",
    categoryId: "jeans",
    image: "/images/catalog/jean-wash.jpg",
    alt: "Light blue jeans",
    pricePaise: 229900,
    mrpPaise: 289900,
    sizes: BOTTOMS,
    summary: "A light wash slim jean, worn with a plain tee.",
  }),
  piece({
    id: "ecru-relaxed-jeans",
    name: "Pale Straight Jeans",
    slug: "ecru-relaxed-jeans",
    categoryId: "jeans",
    image: "/images/catalog/jean-ecru.jpg",
    alt: "Pale jeans worn with a camel coat",
    pricePaise: 269900,
    mrpPaise: 329900,
    sizes: BOTTOMS,
    summary: "Pale denim, straight through the leg, cuffed over a trainer.",
  }),
  piece({
    id: "black-clean-jeans",
    name: "Relaxed Blue Jeans",
    slug: "black-clean-jeans",
    categoryId: "jeans",
    image: "/images/catalog/jean-black.jpg",
    alt: "Relaxed blue jeans",
    pricePaise: 259900,
    mrpPaise: 309900,
    sizes: BOTTOMS,
    summary: "Relaxed blue denim with a little room through the leg.",
  }),
  piece({
    id: "taupe-pleat-trouser",
    name: "Sea Pleat Trouser",
    slug: "taupe-pleat-trouser",
    categoryId: "trousers",
    image: "/images/catalog/trouser-taupe.jpg",
    alt: "Pleated trouser in sea green",
    pricePaise: 219900,
    mrpPaise: 279900,
    sizes: BOTTOMS,
    summary: "A soft pleat in a sea tone. Relaxed through the leg.",
  }),
  piece({
    id: "charcoal-wool-trouser",
    name: "Charcoal Wool Trouser",
    slug: "charcoal-wool-trouser",
    categoryId: "trousers",
    image: "/images/catalog/trouser-charcoal.jpg",
    alt: "Charcoal pleated trousers with a matching jacket",
    pricePaise: 289900,
    mrpPaise: 349900,
    sizes: BOTTOMS,
    summary: "Charcoal pleat trouser, pressed, worn with the matching jacket.",
  }),
  piece({
    id: "stone-chino",
    name: "Wine Dress Trouser",
    slug: "stone-chino",
    categoryId: "trousers",
    image: "/images/catalog/trouser-chino.jpg",
    alt: "Wine dress trousers",
    pricePaise: 179900,
    mrpPaise: 229900,
    sizes: BOTTOMS,
    summary: "Wine dress trousers with a sharp crease.",
  }),
  piece({
    id: "navy-dress-trouser",
    name: "Navy Dress Trouser",
    slug: "navy-dress-trouser",
    categoryId: "trousers",
    image: "/images/catalog/trouser-navy.jpg",
    alt: "Navy tailored trousers",
    pricePaise: 249900,
    mrpPaise: 299900,
    sizes: BOTTOMS,
    summary: "Navy tailored trouser, worn with the suit jacket.",
  }),
  piece({
    id: "tobacco-suede-jacket",
    name: "Black Leather Jacket",
    slug: "tobacco-suede-jacket",
    categoryId: "jackets",
    image: "/images/catalog/jacket-suede.jpg",
    alt: "Black leather biker jacket",
    pricePaise: 599900,
    mrpPaise: 749900,
    sizes: TOPS,
    summary: "Black leather with a zip front. The evening layer.",
  }),
  piece({
    id: "black-bomber",
    name: "Rust Bomber",
    slug: "black-bomber",
    categoryId: "jackets",
    image: "/images/catalog/jacket-bomber.jpg",
    alt: "Rust bomber jacket on a hanger",
    pricePaise: 449900,
    mrpPaise: 549900,
    sizes: TOPS,
    summary: "A rust bomber with a ribbed cuff. Light enough for the evening.",
  }),
  piece({
    id: "camel-overshirt",
    name: "Camel Coat",
    slug: "camel-overshirt",
    categoryId: "jackets",
    image: "/images/catalog/jacket-camel.jpg",
    alt: "Camel wool coat",
    pricePaise: 349900,
    mrpPaise: 429900,
    sizes: TOPS,
    summary: "Camel wool coat, long and clean. The cooler-hour layer.",
  }),
  piece({
    id: "ivory-coach-jacket",
    name: "Black Coat",
    slug: "ivory-coach-jacket",
    categoryId: "jackets",
    image: "/images/catalog/jacket-coach.jpg",
    alt: "Black coat",
    pricePaise: 499900,
    mrpPaise: 599900,
    sizes: TOPS,
    summary: "A black coat with a high collar. Cut close through the shoulder.",
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
