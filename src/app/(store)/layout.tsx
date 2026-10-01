import type { ReactNode } from "react";
import { AccountProvider } from "@/features/account/account-provider";
import { CartProvider } from "@/features/cart/cart-provider";
import { WishlistProvider } from "@/features/wishlist/wishlist-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { VirtualTryOn } from "@/features/try-on/virtual-try-on";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <AccountProvider>
        <WishlistProvider>
          <CartProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
            <VirtualTryOn />
          </CartProvider>
        </WishlistProvider>
      </AccountProvider>
    </SmoothScroll>
  );
}
