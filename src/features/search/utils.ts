import { getAllCategories, getAllProducts } from "@/features/catalog/data";
import type { CatalogProduct } from "@/features/catalog/types";

export function searchCatalog(query: string): CatalogProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return getAllProducts();

  const categories = getAllCategories();

  return getAllProducts().filter((product) => {
    const category = categories.find((item) => item.id === product.categoryId);
    const haystack = [
      product.name,
      product.slug,
      product.summary,
      product.alt,
      category?.name ?? "",
      category?.slug ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
