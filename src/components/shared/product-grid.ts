/**
 * Browse-first grid — enough pieces on screen to compare, like a shop PLP.
 * 2 → 3 → 4 → 5 columns as the viewport grows.
 * Lives outside the "use client" card module so server components receive the real string.
 */
export const productGridClass =
  "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-4 xl:grid-cols-5";
