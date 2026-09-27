# Virtual try-on

The fitting room has two parts:

1. **Live preview.** The garment follows the customer in real time on the camera feed or an uploaded photo. It runs fully in the browser with [MediaPipe Pose Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) (Apache-2.0). It is a style preview: the garment is a flat cut-out placed on the shoulders, so it does not wrap around arms or show folds.
2. **Realistic photo.** One frame (or the uploaded photo) is sent, after consent, to [FASHN VTON 1.5](https://github.com/fashn-AI/fashn-vton-1.5) (Apache-2.0). The model returns a photo of the person wearing the garment with the face, pose and background kept.

Both use the same garment cut-out per product (`CatalogProduct.tryOn`).

## Customer flow

1. **Try on** appears on product cards and product pages for products with `tryOn` data.
2. The customer picks **Live camera** or **Upload photo**. The garment is drawn on them straight away and can be switched in place.
3. **Make realistic photo** takes the current frame (camera) or the original upload (photo).
4. The customer confirms photo consent and selects **Generate realistic photo**.
5. The result shows with an "AI generated photo" label, **Save photo** and **Try another garment**.

## Architecture

```text
Browser
  live-overlay.ts      MediaPipe pose (GPU, CPU fallback) + garment drawn on a canvas
  virtual-try-on.tsx   fitting room UI, consent, result
        |
        | POST /api/try-on/generate  { personImage, productSlug, consent }
        v
Next.js route (Node runtime)
  - checks consent, image type and size, product eligibility
  - rate limit: 5 requests per 10 minutes per IP (in memory)
  - resizes the person photo and flattens the garment on white (sharp)
        |
        v   VTON_MODE
  gradio  Hugging Face Space (official fashn-ai/fashn-vton-1.5, or services/vton on ZeroGPU)
  http    services/vton/server.py on any NVIDIA GPU (Colab, Kaggle, rented)
  fashn   FASHN hosted API (paid), polled through /api/try-on/status/[id]
```

Key files:

| File | Role |
|---|---|
| `src/features/try-on/live-overlay.ts` | Pose tracking, smoothing and garment placement |
| `src/features/try-on/virtual-try-on.tsx` | Fitting room UI |
| `src/app/api/try-on/generate/route.ts` | Validation, rate limit, backend call |
| `src/features/try-on/server/generate.ts` | Backend adapters (`gradio`, `http`, `fashn`) |
| `services/vton/` | Python service: Gradio Space app, FastAPI server, Colab notebook |
| `scripts/try-on/cutout.mjs` | Turns a garment photo on a plain background into a transparent cut-out |

## Setup

Add to `.env.local` (see `.env.example`):

```
VTON_MODE=gradio
VTON_SPACE_ID=fashn-ai/fashn-vton-1.5
HF_TOKEN=hf_...
```

`HF_TOKEN` is a free Hugging Face **Read** token. Without it the route still works on the smaller anonymous quota. Without any backend configured, the route answers 503 and the fitting room says the live preview is ready to use.

Other backends (your own ZeroGPU Space, Colab/Kaggle, a rented GPU) are described in [`services/vton/README.md`](../services/vton/README.md). The Colab notebook clones this repository, so `services/vton` must be pushed first.

## Free-tier limits

| Backend | Free allowance | Notes |
|---|---|---|
| Official Space, no token | About 2 GPU-minutes per day per IP | Fine for a first check |
| Official Space with free token | 5 GPU-minutes per day | A handful of photos per day |
| Own ZeroGPU Space | Same account quota | Account must be verified and older than 30 days |
| Colab / Kaggle | Several GPU-hours | Temporary URL; restart per session |

Measured on the official Space: about 32 seconds per photo, including queueing.

## Adding a garment

1. Photograph the garment flat or on a hanger, straight on, on a plain light or dark background.
2. Run `node scripts/try-on/cutout.mjs <photo> public/images/try-on/<product-id>.png [tolerance] [wireRadius]`. It removes the background (including pockets trapped behind display wires), strips thin wires and stray logos, and prints the silhouette so the anchors can be read off. The house renders on black cut cleanly at tolerance 45, wire radius 3.
3. In `src/features/catalog/data.ts`, set `tryOn: tee("<product-id>", { leftShoulder, rightShoulder, hemY })` on the product. The shoulders are the points where the body meets the sleeve and `hemY` is the hem line, all as fractions of the image (0–1).

## Privacy

- The live preview never uploads camera frames. MediaPipe sends anonymous usage metrics to Google; the fitting room says so.
- A photo is sent only after the consent checkbox, and only to the configured try-on backend.
- The storefront keeps no copies of photos or results. Hugging Face and FASHN have their own retention terms; review them before launch.

## Licence limit before commercial launch

FASHN VTON 1.5 code and weights are Apache-2.0, but it downloads `fashn-human-parser`, which inherits NVIDIA SegFormer's research/evaluation-only licence. Testing is fine. Before real customers use it commercially, replace the parser or get written confirmation from FASHN AI. The paid `fashn` mode is not affected.

## Production checklist

- Move the rate limit to a shared store (the in-memory one resets per server instance).
- Run the Python service on a dedicated GPU with the shared secret, or use the paid API.
- Resolve the human-parser licence.
- Replace the three generated cut-outs with photos of the real products.
