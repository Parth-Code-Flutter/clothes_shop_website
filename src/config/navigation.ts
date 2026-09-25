export type ClothingItem = { label: string; href?: string };
export type ClothingGroup = { label: string; items: ClothingItem[] };

// Proposed navigation taxonomy. Only confirmed catalog destinations have links.
// Fit and print shortcuts can become filters once product metadata is available.
export const clothingGroups: ClothingGroup[] = [
  { label: "T-shirts", items: [
    { label: "Oversized tees" },
    { label: "Graphic tees", href: "/shop?category=graphic-tees" },
    { label: "Plain tees" }, { label: "Polos" },
  ] },
  { label: "Shirts", items: [
    { label: "Casual shirts" }, { label: "Printed shirts" },
    { label: "Checked shirts" }, { label: "Oversized shirts" },
  ] },
  { label: "Bottomwear", items: [
    { label: "Jeans" }, { label: "Cargo pants" }, { label: "Trousers" },
    { label: "Joggers" }, { label: "Shorts" },
  ] },
  { label: "Layers", items: [
    { label: "Hoodies" }, { label: "Sweatshirts" }, { label: "Jackets" },
  ] },
];
