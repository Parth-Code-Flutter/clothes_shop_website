import type { HomepageProduct, ServiceItem } from "./types";

export const homepageProducts: HomepageProduct[] = [
  {
    id: "hulk",
    name: "Hulk T-shirt",
    slug: "hulk-t-shirt",
    image: "/images/products/hulk.jpg",
    alt: "Hulk oversized graphic t-shirt",
    pricePaise: 65000,
    sourceUrl: "https://houseofbollywood.in/",
  },
  {
    id: "spiderman",
    name: "Spiderman T-shirt",
    slug: "spiderman-t-shirt",
    image: "/images/products/spiderman.jpg",
    alt: "Spiderman graphic t-shirt",
    pricePaise: 65000,
    sourceUrl: "https://houseofbollywood.in/",
  },
  {
    id: "deadpool",
    name: "Deadpool T-Shirt",
    slug: "deadpool-t-shirt",
    image: "/images/products/deadpool.jpg",
    alt: "Deadpool graphic t-shirt",
    pricePaise: 65000,
    sourceUrl: "https://houseofbollywood.in/",
  },
  {
    id: "batman-red",
    name: "Batman T-shirt Red",
    slug: "batman-t-shirt-red",
    image: "/images/products/batman-red.jpg",
    alt: "Red Batman Vengeance graphic t-shirt",
    pricePaise: 65000,
    sourceUrl: "https://houseofbollywood.in/",
  },
  {
    id: "batman-yellow",
    name: "Batman T-shirt Yellow",
    slug: "batman-t-shirt-yellow",
    image: "/images/products/batman-yellow.jpg",
    alt: "Yellow Batman graphic t-shirt",
    pricePaise: 65000,
    sourceUrl: "https://houseofbollywood.in/",
  },
];

export const serviceItems: ServiceItem[] = [
  {
    id: "support",
    title: "Talk to us",
    body: "Questions about a drop? Call or email the shop in Junagadh.",
  },
  {
    id: "secure",
    title: "Secure checkout",
    body: "Payments stay on the existing store flow when that page is connected.",
  },
  {
    id: "picks",
    title: "Hand-picked drops",
    body: "The homepage shows the graphic tees currently listed on the live catalog.",
  },
];
