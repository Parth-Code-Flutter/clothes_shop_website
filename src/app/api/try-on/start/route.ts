import { readFile } from "node:fs/promises";
import path from "node:path";
import { getProductBySlug } from "@/features/catalog/data";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.FASHN_API_KEY;
  if (!apiKey) return Response.json({ error: "Virtual try-on is not configured yet. Add FASHN_API_KEY on the server." }, { status: 503 });

  const body = await request.json().catch(() => null) as { personImage?: string; productSlug?: string } | null;
  if (!body?.personImage?.startsWith("data:image/") || body.personImage.length > 15_000_000) return Response.json({ error: "Choose a JPG, PNG, or WebP person photo under 10 MB." }, { status: 400 });
  const product = body.productSlug ? getProductBySlug(body.productSlug) : undefined;
  if (!product || !["shirts", "t-shirts", "jackets"].includes(product.categoryId)) return Response.json({ error: "This product is not ready for AI try-on." }, { status: 400 });

  const relativeImagePath = product.image.replace(/^\//, "");
  const garment = await readFile(path.join(process.cwd(), "public", relativeImagePath));
  const mime = relativeImagePath.endsWith(".png") ? "image/png" : "image/jpeg";
  const response = await fetch("https://api.fashn.ai/v1/run", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model_name: "tryon-v1.6",
      inputs: {
        model_image: body.personImage,
        garment_image: `data:${mime};base64,${garment.toString("base64")}`,
        category: "tops",
        garment_photo_type: "auto",
        mode: "performance",
        output_format: "jpeg",
        return_base64: true,
        moderation_level: "permissive",
      },
    }),
  });
  const data = await response.json().catch(() => null) as { id?: string; error?: string; message?: string } | null;
  if (!response.ok || !data?.id) return Response.json({ error: data?.message ?? data?.error ?? "The AI fitting room could not start." }, { status: response.status || 502 });
  return Response.json({ id: data.id });
}
