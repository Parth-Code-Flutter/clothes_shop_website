# Virtual try-on architecture

## Selected open-source model

Use [FASHN VTON 1.5](https://github.com/fashn-AI/fashn-vton-1.5) as the preferred self-hosted virtual try-on engine. The repository is licensed under Apache 2.0 and accepts a person image plus a garment image to generate a photorealistic image of that person wearing the selected garment.

Supported garment categories include tops, bottoms, and one-pieces. Garment inputs may be flat-lay images or model-worn photos, although clean product photography should give the most dependable storefront results.

## Customer flow

1. The customer selects **Try now** from a product card or product-detail page.
2. They capture a still photo or upload an existing full-body/upper-body photo.
3. The interface explains photo use and requires explicit consent before upload.
4. The Next.js server sends the person image and selected catalog garment image to the private VTON service.
5. The interface shows generation progress, then displays the result with retry, garment-switching, and download options.

The feature must be described as an **AI photo try-on**, not a sizing guarantee or live augmented-reality mirror. Generation is image-to-image and normally takes seconds; it does not continuously replace clothing in a live camera feed.

## Architecture

```text
Browser camera/upload
        |
        v
Next.js server route
  - validates consent, files, and product eligibility
  - keeps model endpoints and credentials server-side
        |
        v
Python VTON service
  - FASHN VTON 1.5 inference
  - CUDA GPU recommended
        |
        v
Generated image returned to the fitting-room UI
```

The model must run as a separate Python inference service; it cannot run directly in the Next.js browser bundle. The model weights are approximately 2 GB, with additional human-parsing assets downloaded during setup. GPU execution is the practical production path. CPU inference may be useful for development checks but will be too slow for a premium customer experience.

## Deployment approach

- **Demo:** a Hugging Face Space/ZeroGPU deployment can provide a low-cost proof of concept, subject to availability, queues, quotas, and platform restrictions.
- **Production:** deploy the Python service on a dedicated GPU host, add authentication and rate limiting, and monitor latency, failures, and GPU usage.
- **Fallback:** when the service is unavailable, keep the normal product gallery usable and explain that AI try-on is temporarily unavailable.

Do not expose an unrestricted inference endpoint from the browser. Validate image type and size, rate-limit requests, remove temporary uploads/results according to a documented retention policy, and never use customer images for training without separate explicit consent.

## Integration status

The current application contains the fitting-room UI and an earlier hosted-provider integration. Migrating the server route to the self-hosted FASHN VTON 1.5 service is the next implementation step; documenting this model does not mean the local GPU service is already deployed or production-tested.

