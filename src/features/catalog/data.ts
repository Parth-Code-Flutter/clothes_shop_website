import type { CatalogCategory, CatalogProduct, TryOnGarment } from "./types";

type CategoryId = "t-shirts" | "shirts" | "jeans" | "trousers";

const TOPS = ["S", "M", "L", "XL"];
const BOTTOMS = ["30", "32", "34", "36"];

// Graphic tees match the live store (₹650). Shirt, jeans and trouser prices are
// placeholders until the client confirms them.
const PRICE_PAISE: Record<CategoryId, number> = {
  "t-shirts": 65000,
  shirts: 149900,
  jeans: 179900,
  trousers: 159900,
};

// Sample compare-at (MRP) prices so offers can be previewed. Replace with client-confirmed MRPs.
const SAMPLE_MRP_PAISE: Partial<Record<string, number>> = {
  "bring-em-on-purple-tee": 89900,
  "dark-knight-brown-tee": 99900,
  "sage-emblem-tee": 79900,
  "hulk-rage-black-tee": 79900,
  "embroidered-plaid-flannel-shirt": 199900,
  "rust-twill-overshirt": 189900,
  "floral-embroidered-taupe-shirt": 179900,
  "jet-black-slim-jeans": 229900,
  "charcoal-acid-wash-jeans": 249900,
  "khaki-drawstring-chinos": 199900,
  "black-drawstring-trousers": 219900,
};

const TEE_SUMMARY = "Premium oversized graphic T-shirt with bold artwork, soft cotton fabric, and a relaxed streetwear fit.";

const DEFAULTS: Record<CategoryId, Pick<CatalogProduct, "fit" | "fabric" | "pattern" | "occasion" | "care">> = {
  "t-shirts": {
    fit: "Oversized fit",
    fabric: "Soft cotton",
    pattern: "Graphic print",
    occasion: "Everyday / streetwear",
    care: "Machine wash cold, inside out. Do not iron directly on the print.",
  },
  shirts: {
    fit: "Relaxed fit",
    fabric: "Woven shirting",
    pattern: "Solid",
    occasion: "Casual / layering",
    care: "Machine wash cold with similar colours. Warm iron on reverse, avoiding embroidery.",
  },
  jeans: {
    fit: "Straight fit",
    fabric: "Washed denim",
    pattern: "Solid wash",
    occasion: "Everyday / casual",
    care: "Machine wash cold, inside out, with similar colours. Line dry.",
  },
  trousers: {
    fit: "Relaxed tapered fit",
    fabric: "Brushed twill",
    pattern: "Solid",
    occasion: "Smart casual / everyday",
    care: "Machine wash cold with similar colours. Warm iron.",
  },
};

// Each garment keeps all of its angles in public/images/products/<category>/<id>/<view>.jpg.
type Draft = {
  id: string;
  name: string;
  categoryId: CategoryId;
  views: string[];
  alt: string;
  color: string;
  details: string[];
  summary?: string;
  fit?: string;
  fabric?: string;
  pattern?: string;
  tryOn?: TryOnGarment;
};

function piece({ views, ...draft }: Draft): CatalogProduct {
  const seed = draft.id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  const gallery = views.map((view) => `/images/products/${draft.categoryId}/${draft.id}/${view}.jpg`);
  const defaults = DEFAULTS[draft.categoryId];
  return {
    ...defaults,
    ...draft,
    slug: draft.id,
    image: gallery[0],
    gallery,
    summary: draft.summary ?? TEE_SUMMARY,
    pricePaise: PRICE_PAISE[draft.categoryId],
    mrpPaise: SAMPLE_MRP_PAISE[draft.id],
    sizes: draft.categoryId === "jeans" || draft.categoryId === "trousers" ? BOTTOMS : TOPS,
    sourceUrl: "/shop",
    rating: Number((3.8 + (seed % 12) / 10).toFixed(1)),
    reviewCount: 18 + (seed % 184),
    popularity: 40 + (seed % 61),
    isNew: seed % 3 === 0,
  };
}

const tee = (id: string, anchors: Omit<TryOnGarment, "image" | "category">): TryOnGarment => ({
  image: `/images/try-on/${id}.png`,
  category: "tops",
  ...anchors,
});

export const catalogCategories: CatalogCategory[] = [
  {
    id: "t-shirts",
    name: "T-Shirts",
    slug: "t-shirts",
    description: "Oversized graphic tees in soft cotton. Bold prints, relaxed fit.",
    image: "/images/products/t-shirts/venom-mustard-tee/front.jpg",
    available: true,
  },
  {
    id: "shirts",
    name: "Shirts",
    slug: "shirts",
    description: "Plaid, embroidered, and pinstripe shirts made for layering.",
    image: "/images/products/shirts/dragonfly-embroidered-black-shirt/front.jpg",
    available: true,
  },
  {
    id: "jeans",
    name: "Jeans",
    slug: "jeans",
    description: "Jet black, indigo, light-wash, and acid-wash denim.",
    image: "/images/products/jeans/indigo-panel-straight-jeans/front.jpg",
    available: true,
  },
  {
    id: "trousers",
    name: "Trousers",
    slug: "trousers",
    description: "Drawstring and pleated trousers with an easy, tapered leg.",
    image: "/images/products/trousers/khaki-drawstring-chinos/front.jpg",
    available: true,
  },
];

const tShirts: CatalogProduct[] = [
  piece({
    id: "venom-mustard-tee",
    name: "Venom Mustard Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Mustard oversized tee with a silver Venom wordmark on the chest",
    color: "Mustard",
    details: ["Venom wordmark across the chest", "Back graphic print", "Contrast orange inner collar", "Dropped shoulders"],
    tryOn: tee("venom-mustard-tee", { leftShoulder: [0.28, 0.1], rightShoulder: [0.73, 0.1], hemY: 0.97 }),
  }),
  piece({
    id: "messi-10-ivory-tee",
    name: "Messi 10 Ivory Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Ivory oversized tee with MESSI printed across the chest",
    color: "Ivory",
    details: ["MESSI wordmark on the chest", "Name and number 10 on the back", "Sleeve text print", "Dropped shoulders"],
    tryOn: tee("messi-10-ivory-tee", { leftShoulder: [0.28, 0.11], rightShoulder: [0.74, 0.11], hemY: 0.97 }),
  }),
  piece({
    id: "deadpool-ivory-tee",
    name: "Deadpool Ivory Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Ivory oversized tee with a red Deadpool wordmark",
    color: "Ivory",
    details: ["Red Deadpool wordmark on the chest", "Full-back Deadpool artwork", "Ribbed crew neck", "Dropped shoulders"],
    tryOn: tee("deadpool-ivory-tee", { leftShoulder: [0.23, 0.12], rightShoulder: [0.75, 0.12], hemY: 0.96 }),
  }),
  piece({
    id: "black-panther-ivory-tee",
    name: "Black Panther Ivory Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Ivory oversized tee with a round Black Panther emblem on the chest",
    color: "Ivory",
    details: ["Round panther emblem on the chest", "Large Black Panther back artwork", "Ribbed crew neck", "Dropped shoulders"],
    tryOn: tee("black-panther-ivory-tee", { leftShoulder: [0.25, 0.12], rightShoulder: [0.75, 0.12], hemY: 0.97 }),
  }),
  piece({
    id: "spider-emblem-beige-tee",
    name: "Spider Emblem Beige Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Beige oversized tee with a white spider emblem on the chest",
    color: "Beige",
    details: ["White spider emblem on the chest", "Colourful Spider-Man back artwork", "Ribbed crew neck", "Dropped shoulders"],
    tryOn: tee("spider-emblem-beige-tee", { leftShoulder: [0.24, 0.09], rightShoulder: [0.75, 0.09], hemY: 0.97 }),
  }),
  piece({
    id: "bat-flight-mustard-tee",
    name: "Bat Flight Mustard Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Mustard oversized tee with a small bat emblem on the chest",
    color: "Mustard",
    details: ["Bat emblem on the chest", "Batman in flight across the back", "Ribbed crew neck", "Dropped shoulders"],
    tryOn: tee("bat-flight-mustard-tee", { leftShoulder: [0.23, 0.13], rightShoulder: [0.8, 0.15], hemY: 0.97 }),
  }),
  piece({
    id: "hulk-smash-blue-tee",
    name: "Hulk Smash Blue Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Royal blue oversized tee with a Hulk chest print",
    color: "Royal blue",
    details: ["Hulk chest print", "Large Hulk back artwork", "Ribbed crew neck", "Dropped shoulders"],
  }),
  piece({
    id: "wakanda-forever-black-tee",
    name: "Wakanda Forever Black Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Black oversized tee with a Wakanda Forever print",
    color: "Black",
    details: ["Chest print", "Black Panther Wakanda Forever back artwork", "Ribbed crew neck", "Dropped shoulders"],
  }),
  piece({
    id: "dr-doom-black-tee",
    name: "Dr. Doom Black Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Black oversized tee with a Dr. Doom chest print",
    color: "Black",
    details: ["Chest text print", "Large green Dr. Doom back artwork", "Ribbed crew neck", "Dropped shoulders"],
  }),
  piece({
    id: "hulk-rage-black-tee",
    name: "Hulk Rage Black Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Black oversized tee with a green Hulk back print",
    color: "Black",
    details: ["Small chest print", "Green Hulk back artwork", "Ribbed crew neck", "Dropped shoulders"],
  }),
  piece({
    id: "dark-knight-brown-tee",
    name: "Dark Knight Brown Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Brown oversized tee with a yellow bat emblem",
    color: "Brown",
    details: ["Yellow bat emblem on the chest", "Yellow Batman back artwork", "Ribbed crew neck", "Dropped shoulders"],
  }),
  piece({
    id: "vengeance-red-tee",
    name: "Vengeance Red Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Red oversized tee with a small chest print",
    color: "Red",
    details: ["Small chest print", "Dark Batman Vengeance back artwork", "Ribbed crew neck", "Dropped shoulders"],
  }),
  piece({
    id: "deadpool-white-tee",
    name: "Deadpool White Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "White oversized tee with a red Deadpool back print",
    color: "White",
    details: ["Small chest print", "Red Deadpool figure on the back", "Ribbed crew neck", "Dropped shoulders"],
  }),
  piece({
    id: "bring-em-on-purple-tee",
    name: "Bring 'Em On Purple Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Purple oversized tee with Bring 'Em On script on the chest",
    color: "Purple",
    details: ["Bring 'Em On chest script", "Character back artwork", "Ribbed crew neck", "Dropped shoulders"],
  }),
  piece({
    id: "court-23-yellow-tee",
    name: "Court 23 Yellow Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Yellow oversized tee with a blue basketball print on the chest",
    color: "Yellow",
    details: ["Blue basketball chest print", "Basketball back artwork", "Ribbed crew neck", "Dropped shoulders"],
  }),
  piece({
    id: "monsters-blue-splatter-tee",
    name: "Monsters Blue Splatter Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Royal blue oversized tee with a chest print",
    color: "Royal blue",
    details: ["Chest print", "Pink splatter back artwork", "Ribbed crew neck", "Dropped shoulders"],
  }),
  piece({
    id: "teddy-bear-navy-tee",
    name: "Teddy Bear Navy Tee",
    categoryId: "t-shirts",
    views: ["front", "back"],
    alt: "Navy oversized tee with a small chest print",
    color: "Navy",
    details: ["Small chest print", "Teddy bear back artwork", "Ribbed crew neck", "Dropped shoulders"],
  }),
  piece({
    id: "avengers-graffiti-tee",
    name: "Avengers Graffiti Tee",
    categoryId: "t-shirts",
    views: ["front", "alt"],
    alt: "Ivory oversized tee covered in colourful Avengers graffiti doodles",
    color: "Ivory",
    pattern: "All-over graphic print",
    details: ["All-over Avengers graffiti print", "Multicolour artwork", "Ribbed crew neck", "Dropped shoulders"],
  }),
  piece({
    id: "bandana-paisley-tee",
    name: "Bandana Paisley Tee",
    categoryId: "t-shirts",
    views: ["front", "alt"],
    alt: "Cream oversized tee with grey bandana paisley panels",
    color: "Cream",
    pattern: "Paisley print",
    details: ["Bandana paisley panels", "Grey-on-cream artwork", "Ribbed crew neck", "Dropped shoulders"],
  }),
  piece({
    id: "sage-emblem-tee",
    name: "Sage Emblem Tee",
    categoryId: "t-shirts",
    views: ["front"],
    alt: "Sage green oversized tee with a round purple emblem on the chest",
    color: "Sage",
    details: ["Round purple emblem on the chest", "Ribbed crew neck", "Dropped shoulders", "Clean, easy colourway"],
  }),
  piece({
    id: "wolverine-aqua-tee",
    name: "Wolverine Aqua Tee",
    categoryId: "t-shirts",
    views: ["back"],
    alt: "Aqua oversized tee with Wolverine back artwork",
    color: "Aqua",
    details: ["Wolverine back artwork", "Ribbed crew neck", "Dropped shoulders", "Bright aqua colourway"],
  }),
  piece({
    id: "gt3-rs-orange-tee",
    name: "GT3 RS Orange Tee",
    categoryId: "t-shirts",
    views: ["back"],
    alt: "Orange oversized tee with racing car back artwork",
    color: "Orange",
    details: ["Racing car back artwork", "Ribbed crew neck", "Dropped shoulders", "Bold orange colourway"],
  }),
  piece({
    id: "dhoni-7-washed-black-tee",
    name: "Dhoni 7 Washed Black Tee",
    categoryId: "t-shirts",
    views: ["back"],
    alt: "Washed black oversized tee with yellow number 7 back artwork",
    color: "Washed black",
    details: ["Yellow number 7 back artwork", "Washed finish", "Ribbed crew neck", "Dropped shoulders"],
  }),
  piece({
    id: "batman-splatter-yellow-tee",
    name: "Batman Splatter Yellow Tee",
    categoryId: "t-shirts",
    views: ["back"],
    alt: "Yellow oversized tee with Batman splatter back artwork",
    color: "Yellow",
    details: ["Batman splatter back artwork", "Ribbed crew neck", "Dropped shoulders", "Bright yellow colourway"],
  }),
];

const shirts: CatalogProduct[] = [
  piece({
    id: "dragonfly-embroidered-black-shirt",
    name: "Dragonfly Embroidered Black Shirt",
    categoryId: "shirts",
    views: ["front", "back"],
    alt: "Black shirt with all-over white dragonfly embroidery",
    color: "Black",
    pattern: "All-over embroidery",
    summary: "A black button-down covered front and back in small dragonfly embroidery.",
    details: ["All-over dragonfly embroidery", "Point collar", "Full button placket", "Long sleeves with buttoned cuffs"],
  }),
  piece({
    id: "rust-twill-overshirt",
    name: "Rust Twill Overshirt",
    categoryId: "shirts",
    views: ["front", "back"],
    alt: "Rust overshirt with two flap chest pockets",
    color: "Rust",
    fabric: "Twill",
    summary: "A rust overshirt with twin flap pockets. Wear it buttoned or open as a light layer.",
    details: ["Two flap chest pockets", "Point collar", "Full button placket", "Curved hem"],
  }),
  piece({
    id: "embroidered-plaid-flannel-shirt",
    name: "Embroidered Plaid Flannel Shirt",
    categoryId: "shirts",
    views: ["front", "back"],
    alt: "Dark green plaid flannel shirt with gold embroidered lettering on the back",
    color: "Forest green plaid",
    fabric: "Brushed flannel",
    pattern: "Plaid with embroidered back",
    summary: "A dark plaid flannel with a large gold embroidered graphic across the back.",
    details: ["Gold embroidered back graphic", "Two chest pockets", "Full button placket", "Long sleeves"],
  }),
  piece({
    id: "layered-plaid-shirt",
    name: "Layered Plaid Shirt",
    categoryId: "shirts",
    views: ["front", "back"],
    alt: "Washed blue plaid shirt layered over white long sleeves",
    color: "Blue-grey plaid",
    fabric: "Washed plaid shirting",
    pattern: "Plaid",
    summary: "A washed blue plaid shirt with built-in white long sleeves for a layered look.",
    details: ["Layered white long sleeves", "Washed plaid finish", "Chest pocket", "Full button placket"],
  }),
  piece({
    id: "floral-embroidered-taupe-shirt",
    name: "Floral Embroidered Taupe Shirt",
    categoryId: "shirts",
    views: ["front", "back"],
    alt: "Taupe shirt with floral embroidery across the chest",
    color: "Taupe",
    pattern: "Floral embroidery",
    summary: "A taupe shirt with delicate floral embroidery across the chest and shoulder.",
    details: ["Floral embroidery on the chest", "Point collar", "Full button placket", "Clean back"],
  }),
  piece({
    id: "red-pinstripe-utility-shirt",
    name: "Red Pinstripe Utility Shirt",
    categoryId: "shirts",
    views: ["front"],
    alt: "Cream shirt with red pinstripes and two flap chest pockets",
    color: "Cream / red stripe",
    pattern: "Pinstripe",
    summary: "A cream pinstripe shirt with utility flap pockets.",
    details: ["Red pinstripes", "Two flap chest pockets", "Point collar", "Full button placket"],
  }),
  piece({
    id: "all-work-pinstripe-shirt",
    name: "All Work Pinstripe Shirt",
    categoryId: "shirts",
    views: ["back"],
    alt: "Ivory pinstripe shirt with All Work and No Play printed on the back",
    color: "Ivory / brown stripe",
    pattern: "Pinstripe with back slogan",
    summary: "An ivory pinstripe shirt with an \"All Work and No Play\" slogan across the back.",
    details: ["All Work and No Play back print", "Brown pinstripes", "Point collar", "Full button placket"],
  }),
];

const jeans: CatalogProduct[] = [
  piece({
    id: "indigo-panel-straight-jeans",
    name: "Indigo Panel Straight Jeans",
    categoryId: "jeans",
    views: ["front", "back"],
    alt: "Dark indigo straight-leg jeans on a hanger",
    color: "Dark indigo",
    summary: "Dark indigo denim in a straight, easy leg.",
    details: ["Dark indigo wash", "Straight leg", "Five-pocket construction", "Button-and-zip closure"],
  }),
  piece({
    id: "belted-light-wash-jeans",
    name: "Belted Light Wash Jeans",
    categoryId: "jeans",
    views: ["front", "detail", "back"],
    alt: "Light-wash jeans with a contrast belt at the waist",
    color: "Light blue",
    summary: "Light-wash denim with a contrast belt and a soft worn-in finish.",
    details: ["Contrast belt included", "Light wash with subtle distressing", "Straight leg", "Five-pocket construction"],
  }),
  piece({
    id: "jet-black-slim-jeans",
    name: "Jet Black Slim Jeans",
    categoryId: "jeans",
    views: ["front", "back"],
    alt: "Jet black slim jeans on a hanger",
    color: "Jet black",
    fit: "Slim fit",
    summary: "Clean jet black denim in a slim leg.",
    details: ["Jet black wash", "Slim leg", "Five-pocket construction", "Button-and-zip closure"],
  }),
  piece({
    id: "black-drawstring-denim-joggers",
    name: "Black Drawstring Denim Joggers",
    categoryId: "jeans",
    views: ["front", "back"],
    alt: "Washed black denim joggers with a drawstring waist",
    color: "Washed black",
    fit: "Tapered fit",
    summary: "Washed black denim with an elasticated drawstring waist and a tapered leg.",
    details: ["Elasticated drawstring waist", "Tapered leg", "Washed black finish", "Side and back pockets"],
  }),
  piece({
    id: "acid-wash-panel-jeans",
    name: "Acid Wash Panel Jeans",
    categoryId: "jeans",
    views: ["front", "back"],
    alt: "Grey acid-wash jeans on a hanger",
    color: "Grey acid wash",
    pattern: "Acid wash",
    summary: "Grey acid-wash denim in a straight leg.",
    details: ["Acid-wash finish", "Straight leg", "Five-pocket construction", "Button-and-zip closure"],
  }),
  piece({
    id: "grey-elastic-skinny-jeans",
    name: "Grey Elastic Skinny Jeans",
    categoryId: "jeans",
    views: ["front"],
    alt: "Grey skinny jeans on a hanger",
    color: "Grey",
    fit: "Skinny fit",
    summary: "Smooth grey denim in a skinny leg.",
    details: ["Grey wash", "Skinny leg", "Five-pocket construction", "Button-and-zip closure"],
  }),
  piece({
    id: "charcoal-acid-wash-jeans",
    name: "Charcoal Acid Wash Jeans",
    categoryId: "jeans",
    views: ["back"],
    alt: "Charcoal acid-wash jeans, back view",
    color: "Charcoal acid wash",
    pattern: "Acid wash",
    summary: "Charcoal acid-wash denim in a straight leg.",
    details: ["Charcoal acid-wash finish", "Straight leg", "Two back pockets", "Belt loops"],
  }),
  piece({
    id: "black-elastic-straight-jeans",
    name: "Black Elastic Straight Jeans",
    categoryId: "jeans",
    views: ["back"],
    alt: "Black straight-leg jeans with an elasticated waist, back view",
    color: "Black",
    summary: "Black denim with an elasticated waist and a straight leg.",
    details: ["Elasticated waist", "Straight leg", "Two back pockets", "Washed black finish"],
  }),
];

const trousers: CatalogProduct[] = [
  piece({
    id: "khaki-drawstring-chinos",
    name: "Khaki Drawstring Chinos",
    categoryId: "trousers",
    views: ["front"],
    alt: "Khaki chinos with a drawstring waist on a hanger",
    color: "Khaki",
    summary: "Khaki chinos with a drawstring waist and a relaxed, tapered leg.",
    details: ["Drawstring waist", "Slant side pockets", "Tapered leg", "Soft brushed finish"],
  }),
  piece({
    id: "ivory-pleated-trousers",
    name: "Ivory Pleated Trousers",
    categoryId: "trousers",
    views: ["front"],
    alt: "Ivory pleated trousers on a hanger",
    color: "Ivory",
    fabric: "Soft woven twill",
    summary: "Ivory trousers with front pleats and a turned-up hem.",
    details: ["Front pleats", "Button-and-zip closure", "Turned-up hem", "Slant side pockets"],
  }),
  piece({
    id: "tobacco-drawstring-trousers",
    name: "Tobacco Drawstring Trousers",
    categoryId: "trousers",
    views: ["front"],
    alt: "Tobacco brown trousers with a drawstring waist on a hanger",
    color: "Tobacco",
    summary: "Tobacco brown trousers with a drawstring waist and a relaxed, tapered leg.",
    details: ["Drawstring waist", "Slant side pockets", "Tapered leg", "Soft brushed finish"],
  }),
  piece({
    id: "black-drawstring-trousers",
    name: "Black Drawstring Trousers",
    categoryId: "trousers",
    views: ["front"],
    alt: "Black trousers with a drawstring waist on a hanger",
    color: "Black",
    fabric: "Soft woven twill",
    summary: "Black trousers with a drawstring waist and a relaxed, tapered leg.",
    details: ["Drawstring waist", "Slant side pockets", "Tapered leg", "Clean black finish"],
  }),
];

// The homepage leads with the first products, so open with a mix of every category.
const FEATURED = [
  "venom-mustard-tee",
  "dragonfly-embroidered-black-shirt",
  "indigo-panel-straight-jeans",
  "messi-10-ivory-tee",
  "khaki-drawstring-chinos",
  "rust-twill-overshirt",
  "deadpool-ivory-tee",
  "belted-light-wash-jeans",
  "black-panther-ivory-tee",
];

const allProducts = [...tShirts, ...shirts, ...jeans, ...trousers];

export const catalogProducts: CatalogProduct[] = [
  ...FEATURED.map((id) => allProducts.find((product) => product.id === id)!),
  ...allProducts.filter((product) => !FEATURED.includes(product.id)),
];

/** Discount filters and sorting only appear once a product carries a compare-at price. */
export const catalogHasOffers = catalogProducts.some((product) => product.mrpPaise && product.mrpPaise > product.pricePaise);

export function getAllCategories() {
  return catalogCategories;
}

export function getCategoryById(id: string) {
  return catalogCategories.find((category) => category.id === id);
}

export function getCategoryBySlug(slug: string) {
  return catalogCategories.find((category) => category.slug === slug);
}

export function getAllProducts() {
  return catalogProducts;
}

export function getProductsByCategory(categoryId: string) {
  return catalogProducts.filter((product) => product.categoryId === categoryId);
}

export function getProductBySlug(slug: string) {
  return catalogProducts.find((product) => product.slug === slug);
}

export function getProductSlugs() {
  return catalogProducts.map((product) => product.slug);
}
