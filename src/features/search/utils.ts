import { getAllCategories, getAllProducts } from "@/features/catalog/data";
import type { CatalogProduct } from "@/features/catalog/types";

export function searchCatalog(query: string): CatalogProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return getAllProducts();

  const categories = getAllCategories();
  const exactCategory = categories.find((item) => item.name.toLowerCase() === q || item.slug.toLowerCase() === q);
  // "shirts" is a substring of "t-shirts", so an exact category name must not spill into other categories.
  if (exactCategory) return getAllProducts().filter((product) => product.categoryId === exactCategory.id);

  return getAllProducts().filter((product) => {
    const category = categories.find((item) => item.id === product.categoryId);
    const haystack = [
      product.name,
      product.slug,
      product.summary,
      product.alt,
      product.color,
      product.fit,
      product.fabric,
      product.pattern,
      product.occasion,
      category?.name ?? "",
      category?.slug ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
