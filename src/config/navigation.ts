export type ClothingItem = { label: string; href?: string };
export type ClothingGroup = { label: string; items: ClothingItem[] };

// Proposed navigation taxonomy. Only confirmed catalog destinations have links.
// Fit and print shortcuts can become filters once product metadata is available.
export const clothingGroups: ClothingGroup[] = [
  { label: "Shirts", items: [{ label: "All shirts", href: "/shop?category=shirts" }] },
  { label: "T-Shirts", items: [{ label: "All t-shirts", href: "/shop?category=t-shirts" }] },
  { label: "Jeans", items: [{ label: "All jeans", href: "/shop?category=jeans" }] },
  { label: "Trousers", items: [{ label: "All trousers", href: "/shop?category=trousers" }] },
  { label: "Jackets", items: [{ label: "All jackets", href: "/shop?category=jackets" }] },
];
