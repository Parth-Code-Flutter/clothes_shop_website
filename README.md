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
- `/shop` product listing with sort
- `/product/[slug]` product detail with gallery and quantity UI

Light and dark themes work from the header toggle. Home and Shop are real routes. Search, account, wishlist, cart, add to cart, buy now, share, and ask us still show a preview notice. The newsletter form does not save or send email. Phone and email links in the footer use the live contact details.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, `next-themes`, Lucide, and Motion.
