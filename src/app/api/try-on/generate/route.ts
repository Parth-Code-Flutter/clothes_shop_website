import { getProductBySlug } from "@/features/catalog/data";
import { configuredMode, generateTryOn, TryOnError } from "@/features/try-on/server/generate";
import { clientKey, takeToken } from "@/features/try-on/server/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_IMAGE_CHARS = 15_000_000;

export async function POST(request: Request) {
  const mode = configuredMode();
  if (!mode) return Response.json({ error: "The realistic photo service is not connected yet. The live preview is ready to use." }, { status: 503 });

  const body = await request.json().catch(() => null) as { personImage?: string; productSlug?: string; consent?: boolean } | null;
  if (body?.consent !== true) return Response.json({ error: "Please confirm consent before generating." }, { status: 400 });
  if (!body.personImage || !/^data:image\/(jpeg|png|webp);base64,/.test(body.personImage) || body.personImage.length > MAX_IMAGE_CHARS) {
    return Response.json({ error: "Choose a JPG, PNG, or WebP photo under 10 MB." }, { status: 400 });
  }
  const product = body.productSlug ? getProductBySlug(body.productSlug) : undefined;
  if (!product?.tryOn) return Response.json({ error: "This product is not ready for AI try-on." }, { status: 400 });

  const wait = takeToken(clientKey(request));
  if (wait) return Response.json({ error: `You have reached the try-on limit for now. Please try again in ${Math.ceil(wait / 60)} min.` }, { status: 429, headers: { "Retry-After": String(wait) } });

  try {
    return Response.json(await generateTryOn(mode, { ...product, tryOn: product.tryOn }, body.personImage));
  } catch (caught) {
    if (caught instanceof TryOnError) return Response.json({ error: caught.message }, { status: caught.status });
    console.error("[try-on] generate failed", caught);
    return Response.json({ error: "The AI fitting room could not finish this photo. Please try again." }, { status: 500 });
  }
}
