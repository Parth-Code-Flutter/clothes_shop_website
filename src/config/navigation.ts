export type ClothingGroup = { label: string; href: string };

// Proposed navigation taxonomy. Only confirmed catalog destinations have links.
// Fit and print shortcuts can become filters once product metadata is available.
export const clothingGroups: ClothingGroup[] = [
  { label: "Shirts", href: "/shop?category=shirts" },
  { label: "T-Shirts", href: "/shop?category=t-shirts" },
  { label: "Jeans", href: "/shop?category=jeans" },
  { label: "Trousers", href: "/shop?category=trousers" },
  { label: "Jackets", href: "/shop?category=jackets" },
];

export const featuredNavigation = [
  { label: "New in", href: "/shop" },
  { label: "Trending", href: "/shop" },
  { label: "Best sellers", href: "/shop" },
  { label: "Offers", href: "/shop", accent: true },
] as const;
