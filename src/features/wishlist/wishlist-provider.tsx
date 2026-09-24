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
import type { WishlistItem, WishlistState } from "./types";
import {
  WISHLIST_STORAGE_KEY,
  emptyWishlist,
  parseWishlist,
} from "./utils";

type WishlistContextValue = {
  items: WishlistItem[];
  count: number;
  hasProduct: (productId: string) => boolean;
  toggleProduct: (product: CatalogProduct) => void;
  removeProduct: (productId: string) => void;
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

let memoryWishlist: WishlistState = emptyWishlist();
let hydrated = false;
const listeners = new Set<() => void>();
const serverWishlist = emptyWishlist();

function emit() {
  for (const listener of listeners) listener();
}

function hydrateFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  memoryWishlist = parseWishlist(
    window.localStorage.getItem(WISHLIST_STORAGE_KEY),
  );
  hydrated = true;
}

function writeWishlist(next: WishlistState) {
  memoryWishlist = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
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
  return memoryWishlist;
}

function getServerSnapshot() {
  return serverWishlist;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const toggleProduct = useCallback((product: CatalogProduct) => {
    const current = getSnapshot();
    const exists = current.items.some((item) => item.productId === product.id);
    if (exists) {
      writeWishlist({
        items: current.items.filter((item) => item.productId !== product.id),
      });
      return;
    }
    writeWishlist({
      items: [
        ...current.items,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          alt: product.alt,
          pricePaise: product.pricePaise,
        },
      ],
    });
  }, []);

  const removeProduct = useCallback((productId: string) => {
    const current = getSnapshot();
    writeWishlist({
      items: current.items.filter((item) => item.productId !== productId),
    });
  }, []);

  const clearWishlist = useCallback(() => writeWishlist(emptyWishlist()), []);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items: state.items,
      count: state.items.length,
      hasProduct: (productId: string) =>
        state.items.some((item) => item.productId === productId),
      toggleProduct,
      removeProduct,
      clearWishlist,
    }),
    [state, toggleProduct, removeProduct, clearWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const value = useContext(WishlistContext);
  if (!value) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }
  return value;
}
