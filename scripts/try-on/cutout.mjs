#!/usr/bin/env node
// Turns a front-facing garment photo on a plain, light background into a
// transparent try-on PNG, then prints the silhouette so shoulder anchors and
// hem can be read off for `TRY_ON` in src/features/catalog/data.ts.
//
// Usage: node scripts/try-on/cutout.mjs <input.jpg> public/images/try-on/<name>.png [tolerance]
import sharp from "sharp";

const [input, output, toleranceArg] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: node scripts/try-on/cutout.mjs <input> <output.png> [tolerance=38]");
  process.exit(1);
}
const tolerance = Number(toleranceArg ?? 38);

const { data, info } = await sharp(input).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const at = (x, y) => (y * W + x) * 4;

const corners = [at(0, 0), at(W - 1, 0), at(0, H - 1), at(W - 1, H - 1)];
const bg = [0, 1, 2].map((c) => corners.reduce((sum, i) => sum + data[i + c], 0) / corners.length);
const distance = (i) => Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);

// Flood fill from every border pixel so background enclosed by the garment
// (for example inside a collar) is kept.
const background = new Uint8Array(W * H);
const stack = [];
for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
while (stack.length) {
  const p = stack.pop();
  if (background[p] || distance(p * 4) > tolerance) continue;
  background[p] = 1;
  const x = p % W;
  if (x > 0) stack.push(p - 1);
  if (x < W - 1) stack.push(p + 1);
  if (p >= W) stack.push(p - W);
  if (p < W * (H - 1)) stack.push(p + W);
}

for (let p = 0; p < W * H; p++) {
  if (background[p]) data[p * 4 + 3] = 0;
}
// Soften the one-pixel edge so the overlay has no hard white fringe.
for (let y = 1; y < H - 1; y++) {
  for (let x = 1; x < W - 1; x++) {
    const p = y * W + x;
    if (background[p]) continue;
    const neighbours = background[p - 1] + background[p + 1] + background[p - W] + background[p + W];
    if (neighbours) data[p * 4 + 3] = Math.round(255 * (1 - neighbours / 5));
  }
}

await sharp(data, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 1 }).png().toFile(output);

const { data: out, info: outInfo } = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const rows = [];
for (let step = 0; step <= 40; step++) {
  const y = Math.min(outInfo.height - 1, Math.round((step / 40) * (outInfo.height - 1)));
  let left = -1;
  let right = -1;
  for (let x = 0; x < outInfo.width; x++) {
    if (out[(y * outInfo.width + x) * 4 + 3] > 128) {
      if (left < 0) left = x;
      right = x;
    }
  }
  rows.push(`${(y / outInfo.height).toFixed(2)}  ${left < 0 ? "-" : `${(left / outInfo.width).toFixed(2)} – ${(right / outInfo.width).toFixed(2)}`}`);
}
console.log(`Saved ${output} (${outInfo.width}×${outInfo.height}). Silhouette by row (y  left – right):`);
console.log(rows.join("\n"));
