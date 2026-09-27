#!/usr/bin/env node
// Turns a front-facing garment photo on a plain background (light or dark) into
// a transparent try-on PNG, then prints the silhouette so shoulder anchors and
// hem can be read off for `TRY_ON` in src/features/catalog/data.ts.
//
// Every pixel close to the corner colour counts as background, including pockets
// trapped behind display wires. Thin lines are then opened away, only the largest
// shape is kept (dropping logos and props), and holes smaller than `holeFraction`
// of the frame are filled back so prints in the backdrop colour survive.
//
// Usage: node scripts/try-on/cutout.mjs <input.jpg> <output.png> [tolerance=38] [wireRadius=3] [holeFraction=0.01]
import sharp from "sharp";

const [input, output, toleranceArg, radiusArg, holeArg] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: node scripts/try-on/cutout.mjs <input> <output.png> [tolerance=38] [wireRadius=3] [holeFraction=0.01]");
  process.exit(1);
}
const tolerance = Number(toleranceArg ?? 38);
const radius = Number(radiusArg ?? 3);
const holeFraction = Number(holeArg ?? 0.01);

const { data, info } = await sharp(input).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const N = W * H;
const at = (x, y) => (y * W + x) * 4;

const corners = [at(0, 0), at(W - 1, 0), at(0, H - 1), at(W - 1, H - 1)];
const bg = [0, 1, 2].map((c) => corners.reduce((sum, i) => sum + data[i + c], 0) / corners.length);
const distance = (i) => Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);

function morph(mask, erode) {
  const pass = (src, horizontal) => {
    const out = new Uint8Array(N);
    for (let p = 0; p < N; p++) {
      const x = p % W;
      const y = (p - x) / W;
      let value = erode ? 1 : 0;
      for (let d = -radius; d <= radius; d++) {
        const nx = horizontal ? x + d : x;
        const ny = horizontal ? y : y + d;
        const v = nx >= 0 && nx < W && ny >= 0 && ny < H ? src[ny * W + nx] : 0;
        if (erode ? !v : v) {
          value = erode ? 0 : 1;
          break;
        }
      }
      out[p] = value;
    }
    return out;
  };
  return pass(pass(mask, true), false);
}

// Labels 4-connected regions where mask[p] === target; returns labels and sizes.
function components(mask, target) {
  const label = new Int32Array(N);
  const sizes = [0];
  const touchesBorder = [false];
  for (let start = 0; start < N; start++) {
    if (mask[start] !== target || label[start]) continue;
    const id = sizes.length;
    let size = 0;
    let border = false;
    const queue = [start];
    label[start] = id;
    while (queue.length) {
      const p = queue.pop();
      size++;
      const x = p % W;
      if (x === 0 || x === W - 1 || p < W || p >= N - W) border = true;
      for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, p - W, p + W]) {
        if (q >= 0 && q < N && mask[q] === target && !label[q]) {
          label[q] = id;
          queue.push(q);
        }
      }
    }
    sizes.push(size);
    touchesBorder.push(border);
  }
  return { label, sizes, touchesBorder };
}

let garment = new Uint8Array(N);
for (let p = 0; p < N; p++) garment[p] = distance(p * 4) > tolerance ? 1 : 0;
if (radius > 0) garment = morph(morph(garment, true), false);

const solid = components(garment, 1);
const largest = solid.sizes.indexOf(Math.max(...solid.sizes.slice(1)));
for (let p = 0; p < N; p++) garment[p] = solid.label[p] === largest ? 1 : 0;

const holes = components(garment, 0);
for (let p = 0; p < N; p++) {
  const id = holes.label[p];
  if (id && !holes.touchesBorder[id] && holes.sizes[id] < holeFraction * N) garment[p] = 1;
}

const background = new Uint8Array(N);
for (let p = 0; p < N; p++) {
  background[p] = garment[p] ? 0 : 1;
  if (background[p]) data[p * 4 + 3] = 0;
}
// Soften the one-pixel edge so the overlay has no hard fringe.
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
