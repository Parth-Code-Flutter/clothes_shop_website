export type WishlistItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  alt: string;
  pricePaise: number;
};

export type WishlistState = {
  items: WishlistItem[];
};
