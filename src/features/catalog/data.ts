import type { CatalogCategory, CatalogProduct, TryOnGarment } from "./types";

const TOPS = ["S", "M", "L", "XL"];
const BOTTOMS = ["30", "32", "34", "36"];

const TRY_ON = {
  whiteTee: { image: "/images/try-on/white-tee.png", category: "tops", leftShoulder: [0.19, 0.12], rightShoulder: [0.81, 0.12], hemY: 0.95 },
  denimShirt: { image: "/images/try-on/denim-shirt.png", category: "tops", leftShoulder: [0.2, 0.18], rightShoulder: [0.8, 0.18], hemY: 0.94 },
  blackJacket: { image: "/images/try-on/black-jacket.png", category: "tops", leftShoulder: [0.22, 0.17], rightShoulder: [0.78, 0.17], hemY: 0.86 },
} satisfies Record<string, TryOnGarment>;

function piece(
  product: Omit<CatalogProduct, "gallery" | "sourceUrl" | "rating" | "reviewCount" | "color" | "fit" | "fabric" | "pattern" | "occasion" | "care" | "details" | "popularity" | "isNew"> & { gallery?: string[]; color?: string; fit?: string; fabric?: string; pattern?: string },
): CatalogProduct {
  const seed = product.id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  const isBottom = product.categoryId === "jeans" || product.categoryId === "trousers";
  const defaults = product.categoryId === "jeans"
    ? { fit: product.name.includes("Slim") ? "Slim fit" : product.name.includes("Relaxed") ? "Relaxed fit" : "Straight fit", fabric: "98% cotton, 2% elastane denim", pattern: "Solid washed denim", occasion: "Everyday / casual", care: "Machine wash cold, inside out. Wash with similar colours and line dry.", details: ["Mid-rise waist", "Five-pocket construction", "Button-and-zip closure", "Comfort stretch denim"] }
    : product.categoryId === "trousers"
      ? { fit: "Relaxed tailored fit", fabric: product.name.includes("Wool") ? "Wool-blend twill" : "Cotton-blend twill", pattern: "Solid", occasion: "Smart casual / occasion", care: "Gentle machine wash or dry clean as marked on the garment.", details: ["Mid-rise waist", "Front pleat detail", "Side and back pockets", "Button-and-zip closure"] }
      : product.categoryId === "jackets"
        ? { fit: "Regular fit", fabric: product.name.includes("Leather") ? "Faux leather outer, polyester lining" : "Structured woven outer", pattern: "Solid", occasion: "Layering / evening", care: "Specialist clean only. Store on a broad hanger.", details: ["Fully lined", "Functional front pockets", "Long sleeves", "Secure front fastening"] }
        : { fit: product.name.includes("Hoodie") ? "Relaxed fit" : "Regular fit", fabric: product.categoryId === "t-shirts" ? "100% combed cotton" : product.name.includes("Denim") ? "Cotton denim" : "Breathable cotton weave", pattern: product.name.includes("Check") ? "Check" : "Solid", occasion: "Everyday / casual", care: "Machine wash cold with similar colours. Warm iron on reverse.", details: [isBottom ? "Mid-rise waist" : "Classic neckline", "Easy everyday construction", "Soft-touch finish", "Designed for repeat wear"] };
  const colourWords = ["white", "ivory", "indigo", "coral", "blue", "black", "stone", "grey", "mustard", "midnight", "pale", "taupe", "sea", "charcoal", "wine", "navy", "rust", "camel"];
  const colour = colourWords.find((word) => `${product.name} ${product.alt}`.toLowerCase().includes(word));
  return {
    ...product,
    color: product.color ?? (colour ? colour[0].toUpperCase() + colour.slice(1) : "Neutral"),
    fit: product.fit ?? defaults.fit,
    fabric: product.fabric ?? defaults.fabric,
    pattern: product.pattern ?? defaults.pattern,
    occasion: defaults.occasion,
    care: defaults.care,
    details: defaults.details,
    rating: Number((3.8 + (seed % 12) / 10).toFixed(1)),
    reviewCount: 18 + (seed % 184),
    popularity: 40 + (seed % 61),
    isNew: seed % 3 === 0,
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
    name: "Indigo Denim Overshirt",
    slug: "indigo-oxford-shirt",
    categoryId: "shirts",
    image: "/images/products/denim-editorial-1.jpg",
    gallery: [
      "/images/products/denim-editorial-1.jpg",
      "/images/products/denim-editorial-2.jpg",
      "/images/products/denim-editorial-3.jpg",
      "/images/products/denim-editorial-4.jpg",
    ],
    alt: "Model wearing a light-wash denim overshirt",
    pricePaise: 219900,
    mrpPaise: 279900,
    sizes: TOPS,
    summary: "A light-wash denim layer presented with temporary editorial imagery for the storefront concept.",
    tryOn: TRY_ON.denimShirt,
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
    tryOn: TRY_ON.whiteTee,
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
    tryOn: TRY_ON.whiteTee,
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
    tryOn: TRY_ON.blackJacket,
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
