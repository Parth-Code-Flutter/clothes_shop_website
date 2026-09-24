import type { CatalogCategory, CatalogProduct } from "./types";

/**
 * Category shelf for a multi-drop Gen Z catalog.
 * Only Graphic Tees have live products today. Other shelves stay listed
 * so the shop can grow without inventing merchandise.
 */
export const catalogCategories: CatalogCategory[] = [
  {
    id: "graphic-tees",
    name: "Graphic Tees",
    slug: "graphic-tees",
    description: "Oversized character drops currently live on the store.",
    available: true,
  },
  {
    id: "hoodies",
    name: "Hoodies",
    slug: "hoodies",
    description: "Ready for the next drop. No products listed yet.",
    available: false,
  },
  {
    id: "accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Ready for the next drop. No products listed yet.",
    available: false,
  },
  {
    id: "limited",
    name: "Limited Drops",
    slug: "limited-drops",
    description: "Ready for seasonal or collab capsules.",
    available: false,
  },
];

export const catalogProducts: CatalogProduct[] = [
  {
    id: "hulk",
    name: "Hulk T-shirt",
    slug: "hulk-tshirt",
    categoryId: "graphic-tees",
    image: "/images/products/hulk.jpg",
    gallery: [
      "/images/products/hulk.jpg",
      "/images/products/hulk-alt.jpg",
    ],
    alt: "Hulk oversized graphic t-shirt",
    pricePaise: 65000,
    sourceUrl: "https://houseofbollywood.in/product/hulk-tshirt/",
    summary:
      "Oversized graphic tee from the House of Bollywood catalog. Price shown as listed on the live store.",
  },
  {
    id: "spiderman",
    name: "Spiderman T-shirt",
    slug: "spiderman-tshirt",
    categoryId: "graphic-tees",
    image: "/images/products/spiderman.jpg",
    gallery: [
      "/images/products/spiderman.jpg",
      "/images/products/spiderman-alt.jpg",
    ],
    alt: "Spiderman graphic t-shirt",
    pricePaise: 65000,
    sourceUrl: "https://houseofbollywood.in/product/spiderman-tshirt/",
    summary:
      "Oversized graphic tee from the House of Bollywood catalog. Price shown as listed on the live store.",
  },
  {
    id: "deadpool",
    name: "Deadpool T-Shirt",
    slug: "deadpool-tshirt",
    categoryId: "graphic-tees",
    image: "/images/products/deadpool.jpg",
    gallery: [
      "/images/products/deadpool.jpg",
      "/images/products/deadpool-alt.jpg",
    ],
    alt: "Deadpool graphic t-shirt",
    pricePaise: 65000,
    sourceUrl: "https://houseofbollywood.in/product/deadpool-tshirt/",
    summary:
      "Oversized graphic tee from the House of Bollywood catalog. Price shown as listed on the live store.",
  },
  {
    id: "batman-red",
    name: "Batman T-shirt Red",
    slug: "batman-red",
    categoryId: "graphic-tees",
    image: "/images/products/batman-red.jpg",
    gallery: [
      "/images/products/batman-red.jpg",
      "/images/products/batman-red-alt.jpg",
    ],
    alt: "Red Batman Vengeance graphic t-shirt",
    pricePaise: 65000,
    sourceUrl: "https://houseofbollywood.in/product/batman-red/",
    summary:
      "Oversized graphic tee from the House of Bollywood catalog. Price shown as listed on the live store.",
  },
  {
    id: "batman-yellow",
    name: "Batman T-shirt Yellow",
    slug: "batman-yellow",
    categoryId: "graphic-tees",
    image: "/images/products/batman-yellow.jpg",
    gallery: [
      "/images/products/batman-yellow.jpg",
      "/images/products/batman-yellow-alt.jpg",
    ],
    alt: "Yellow Batman graphic t-shirt",
    pricePaise: 65000,
    sourceUrl: "https://houseofbollywood.in/product/batman-yellow/",
    summary:
      "Oversized graphic tee from the House of Bollywood catalog. Price shown as listed on the live store.",
  },
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
