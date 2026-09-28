import { catalogProducts } from "@/features/catalog/data";
import type { CartLine, CartState } from "./types";

export const CART_STORAGE_KEY = "hob-cart-v1";
export const FREE_SHIPPING_PAISE = 199900;

export function emptyCart(): CartState {
  return { lines: [] };
}

export function cartItemCount(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function cartSubtotalPaise(lines: CartLine[]) {
  return lines.reduce(
    (total, line) => total + line.pricePaise * line.quantity,
    0,
  );
}

export function parseCart(raw: string | null): CartState {
  if (!raw) return emptyCart();
  try {
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed || !Array.isArray(parsed.lines)) return emptyCart();
    // Saved lines follow the live catalog: retired pieces drop out and the
    // name, photo, and price always reflect the current listing.
    return {
      lines: parsed.lines.flatMap((line) => {
        if (typeof line.quantity !== "number" || line.quantity <= 0) return [];
        const product = catalogProducts.find((item) => item.id === line.productId);
        if (!product) return [];
        return [{ ...line, slug: product.slug, name: product.name, image: product.image, alt: product.alt, pricePaise: product.pricePaise }];
      }),
    };
  } catch {
    return emptyCart();
  }
}
