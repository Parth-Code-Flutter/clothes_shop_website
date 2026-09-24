import { catalogProducts } from "@/features/catalog/data";
import type { ServiceItem } from "@/features/catalog/types";

export const homepageProducts = catalogProducts;

export const serviceItems: ServiceItem[] = [
  {
    id: "support",
    title: "Talk to us",
    body: "Questions about a drop? Call or email the shop in Junagadh.",
  },
  {
    id: "secure",
    title: "Secure checkout",
    body: "Payments stay on the existing store flow when that page is connected.",
  },
  {
    id: "picks",
    title: "Hand-picked drops",
    body: "The homepage shows the graphic tees currently listed on the live catalog.",
  },
];
