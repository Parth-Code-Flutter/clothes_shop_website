import { catalogProducts } from "@/features/catalog/data";
import type { WishlistState } from "./types";

export const WISHLIST_STORAGE_KEY = "hob-wishlist-v1";

export function emptyWishlist(): WishlistState {
  return { items: [] };
}

export function parseWishlist(raw: string | null): WishlistState {
  if (!raw) return emptyWishlist();
  try {
    const parsed = JSON.parse(raw) as WishlistState;
    if (!parsed || !Array.isArray(parsed.items)) return emptyWishlist();
    return {
      items: parsed.items.flatMap((item) => {
        const product = catalogProducts.find((entry) => entry.id === item?.productId);
        if (!product) return [];
        return [{ productId: product.id, slug: product.slug, name: product.name, image: product.image, alt: product.alt, pricePaise: product.pricePaise }];
      }),
    };
  } catch {
    return emptyWishlist();
  }
}
