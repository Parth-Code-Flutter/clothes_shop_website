import { getAllCategories } from "@/features/catalog/data";

/**
 * Clothes-shop Mens shelves — mirrors catalog categories from the live store
 * structure (tees live; other shelves marked soon). Few options, not a full invent.
 */

export type NavSubLink = {
  label: string;
  href: string;
  description: string;
  available: boolean;
  categoryId?: string;
};

export function getMensSubLinks(): NavSubLink[] {
  return getAllCategories().map((category) => ({
    label: category.name,
    href: `/shop?category=${category.id}`,
    description: category.description,
    available: category.available,
    categoryId: category.id,
  }));
}
