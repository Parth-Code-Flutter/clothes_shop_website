"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CatalogProduct } from "@/features/catalog/types";
import type { CartLine, CartState } from "./types";
import {
  CART_STORAGE_KEY,
  cartItemCount,
  cartSubtotalPaise,
  emptyCart,
  parseCart,
} from "./utils";

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotalPaise: number;
  addProduct: (product: CatalogProduct, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

let memoryCart: CartState = emptyCart();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function hydrateFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  memoryCart = parseCart(window.localStorage.getItem(CART_STORAGE_KEY));
  hydrated = true;
}

function writeCart(next: CartState) {
  memoryCart = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
  }
  emit();
}

function subscribe(listener: () => void) {
  hydrateFromStorage();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  hydrateFromStorage();
  return memoryCart;
}

const serverCart = emptyCart();

function getServerSnapshot() {
  return serverCart;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addProduct = useCallback((product: CatalogProduct, quantity = 1) => {
    const qty = Math.max(1, quantity);
    const current = getSnapshot();
    const existing = current.lines.find((line) => line.productId === product.id);
    if (existing) {
      writeCart({
        lines: current.lines.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: line.quantity + qty }
            : line,
        ),
      });
      return;
    }
    const next: CartLine = {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      alt: product.alt,
      pricePaise: product.pricePaise,
      quantity: qty,
    };
    writeCart({ lines: [...current.lines, next] });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const current = getSnapshot();
    writeCart({
      lines: current.lines
        .map((line) =>
          line.productId === productId
            ? { ...line, quantity: Math.max(0, quantity) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    });
  }, []);

  const removeLine = useCallback((productId: string) => {
    const current = getSnapshot();
    writeCart({
      lines: current.lines.filter((line) => line.productId !== productId),
    });
  }, []);

  const clearCart = useCallback(() => writeCart(emptyCart()), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      itemCount: cartItemCount(state.lines),
      subtotalPaise: cartSubtotalPaise(state.lines),
      addProduct,
      setQuantity,
      removeLine,
      clearCart,
    }),
    [state, addProduct, setQuantity, removeLine, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return value;
}
