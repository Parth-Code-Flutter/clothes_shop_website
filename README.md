# House of Bollywood

Homepage redesign preview for [houseofbollywood.in](https://houseofbollywood.in/).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Current scope

Built pages:

- `/` homepage
- `/shop` product listing with categories + sort
- `/product/[slug]` product detail with gallery and add-to-bag
- `/checkout` billing + order summary; Razorpay and promo stay preview

Light and dark themes work from the header toggle. Home, Shop, Bag, and Checkout are real routes. Search, account, and wishlist still show a preview notice. The newsletter form does not save or send email. Phone and email links in the footer use the live contact details.

The catalog is multi-category ready (tees live; hoodies / accessories / limited drops marked soon). Tone is aimed at Gen Z shoppers.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, `next-themes`, Lucide, and Motion.
