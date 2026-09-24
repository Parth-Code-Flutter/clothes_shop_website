import type { WishlistItem, WishlistState } from "./types";

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
      items: parsed.items.filter(
        (item): item is WishlistItem =>
          typeof item?.productId === "string" &&
          typeof item?.slug === "string",
      ),
    };
  } catch {
    return emptyWishlist();
  }
}
