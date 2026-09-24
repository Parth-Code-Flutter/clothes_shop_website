import type { CartLine, CartState } from "./types";

export const CART_STORAGE_KEY = "hob-cart-v1";

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
    return {
      lines: parsed.lines.filter(
        (line) =>
          typeof line.productId === "string" &&
          typeof line.quantity === "number" &&
          line.quantity > 0,
      ),
    };
  } catch {
    return emptyCart();
  }
}
