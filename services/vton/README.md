---
title: House of Bollywood Try-On
sdk: gradio
sdk_version: 6.3.0
python_version: 3.10.14
app_file: app.py
pinned: false
license: apache-2.0
short_description: FASHN VTON v1.5 try-on service for the storefront
---

# Try-on service (FASHN VTON v1.5)

This folder is the realistic-photo half of the fitting room. The live camera preview runs in the browser and needs nothing from here.

The storefront route `src/app/api/try-on/generate/route.ts` picks a backend with `VTON_MODE`:

| `VTON_MODE` | Backend | Env vars |
|---|---|---|
| `gradio` | A Hugging Face Space: the official `fashn-ai/fashn-vton-1.5`, or your own copy of this folder | `VTON_SPACE_ID`, `HF_TOKEN` |
| `http` | `server.py` on any NVIDIA GPU (Colab, Kaggle, rented GPU) | `VTON_ENDPOINT_URL`, `VTON_SHARED_SECRET` |
| `fashn` | FASHN hosted API (paid) | `FASHN_API_KEY` |

## Option A: quickest test (official Space, no setup)

1. Create a free account at huggingface.co and a **Read** token under Settings > Access Tokens.
2. In the storefront `.env.local`:

```
VTON_MODE=gradio
VTON_SPACE_ID=fashn-ai/fashn-vton-1.5
HF_TOKEN=hf_...
```

The token makes requests count against your account's free ZeroGPU quota (5 GPU-minutes per day on a free account, 2 minutes without a token). That is a handful of try-ons per day. The route also works without `HF_TOKEN` on the smaller anonymous quota, which is enough for a first check (tested: about 32 seconds per photo).

## Option B: your own free ZeroGPU Space

Needs a Hugging Face account in good standing (verified email, older than 30 days). Free accounts can host up to 2 ZeroGPU Spaces.

1. Create a new Space: SDK **Gradio**, hardware **ZeroGPU**.
2. Upload `app.py`, `pipeline.py`, `requirements.txt` and this `README.md` (its header is the Space config).
3. Set `VTON_SPACE_ID=<your-user>/<space-name>` in `.env.local`.

## Option C: Colab or Kaggle (more GPU time, temporary URL)

Open `colab.ipynb` in Colab (or Kaggle), pick a GPU runtime, set `SECRET`, run all cells, then:

```
VTON_MODE=http
VTON_ENDPOINT_URL=https://<printed>.trycloudflare.com
VTON_SHARED_SECRET=<same as SECRET>
```

## Hardware

About 8 GB of NVIDIA GPU memory. Roughly 5 seconds per image on an H100 at 50 steps; this service defaults to 30 steps. Apple Silicon Macs are not supported by the upstream code path (it expects CUDA).

## License

- FASHN VTON v1.5 code and weights: Apache-2.0.
- DWPose and YOLOX: Apache-2.0.
- `fashn-human-parser` (downloaded automatically on first run): inherits the NVIDIA SegFormer license, which allows research or evaluation use only.

Free testing is fine. Before real customers use this commercially, replace the human parser or get written confirmation from FASHN AI.
