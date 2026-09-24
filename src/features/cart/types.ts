export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  alt: string;
  pricePaise: number;
  quantity: number;
};

export type CartState = {
  lines: CartLine[];
};
