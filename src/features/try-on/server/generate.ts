import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { CatalogProduct, TryOnGarment } from "@/features/catalog/types";

export type TryOnMode = "gradio" | "http" | "fashn";
export type TryOnResult = { image: string } | { id: string };

export class TryOnError extends Error {
  constructor(message: string, readonly status = 502) {
    super(message);
  }
}

const REQUEST_TIMEOUT_MS = 110_000;
const PERSON_MAX = { width: 1152, height: 1536 };

export function configuredMode(): TryOnMode | null {
  const mode = process.env.VTON_MODE?.trim().toLowerCase();
  if (mode === "gradio" && process.env.VTON_SPACE_ID) return "gradio";
  if (mode === "http" && process.env.VTON_ENDPOINT_URL && process.env.VTON_SHARED_SECRET) return "http";
  if ((mode === "fashn" || !mode) && process.env.FASHN_API_KEY) return "fashn";
  return null;
}

async function preparePerson(dataUrl: string) {
  const buffer = Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
  try {
    return await sharp(buffer).rotate().resize({ ...PERSON_MAX, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 90 }).toBuffer();
  } catch {
    throw new TryOnError("This photo could not be read. Choose a JPG, PNG, or WebP image.", 400);
  }
}

async function prepareGarment(garment: TryOnGarment) {
  const file = await readFile(path.join(process.cwd(), "public", garment.image.replace(/^\//, "")));
  return sharp(file).flatten({ background: "#ffffff" }).jpeg({ quality: 92 }).toBuffer();
}

const toDataUrl = (buffer: Buffer | ArrayBuffer, mime = "image/jpeg") => `data:${mime};base64,${Buffer.from(buffer as ArrayBuffer).toString("base64")}`;

function friendlyRemoteError(caught: unknown) {
  const message = typeof caught === "object" && caught && "message" in caught ? String((caught as { message: unknown }).message) : String(caught);
  if (/quota|exceeded/i.test(message)) return new TryOnError("Today's free AI try-on allowance is used up. The live preview is still available.", 429);
  if (/abort|timeout/i.test(message)) return new TryOnError("The AI fitting room took too long. Please try again.", 504);
  return new TryOnError("The AI fitting room is busy right now. Please try again in a moment.");
}

async function runGradio(person: Buffer, garment: Buffer, category: TryOnGarment["category"]): Promise<TryOnResult> {
  const { Client, handle_file } = await import("@gradio/client");
  const token = process.env.HF_TOKEN?.startsWith("hf_") ? (process.env.HF_TOKEN as `hf_${string}`) : undefined;
  try {
    const client = await Client.connect(process.env.VTON_SPACE_ID!, { token });
    const result = await client.predict<Array<{ url?: string } | null>>("/try_on", {
      person_image: handle_file(new Blob([new Uint8Array(person)], { type: "image/jpeg" })),
      garment_image: handle_file(new Blob([new Uint8Array(garment)], { type: "image/jpeg" })),
      category,
      garment_photo_type: "flat-lay",
      num_timesteps: 30,
      guidance_scale: 1.5,
      seed: 42,
      segmentation_free: true,
    });
    const url = result.data?.[0]?.url;
    if (!url) throw new Error("Empty result");
    const image = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined, signal: AbortSignal.timeout(30_000) });
    if (!image.ok) throw new Error(`Result download failed (${image.status})`);
    return { image: toDataUrl(await image.arrayBuffer(), image.headers.get("content-type") ?? "image/webp") };
  } catch (caught) {
    throw friendlyRemoteError(caught);
  }
}

async function runHttp(person: Buffer, garment: Buffer, category: TryOnGarment["category"]): Promise<TryOnResult> {
  const endpoint = process.env.VTON_ENDPOINT_URL!.replace(/\/+$/, "");
  try {
    const response = await fetch(`${endpoint}/tryon`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Vton-Secret": process.env.VTON_SHARED_SECRET! },
      body: JSON.stringify({ person_image: toDataUrl(person), garment_image: toDataUrl(garment), category, garment_photo_type: "flat-lay" }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const data = await response.json().catch(() => null) as { image?: string; detail?: string } | null;
    if (!response.ok || !data?.image) throw new Error(data?.detail ?? `Try-on server replied ${response.status}`);
    return { image: data.image };
  } catch (caught) {
    throw friendlyRemoteError(caught);
  }
}

async function runFashn(person: Buffer, garment: Buffer): Promise<TryOnResult> {
  const response = await fetch("https://api.fashn.ai/v1/run", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.FASHN_API_KEY}` },
    body: JSON.stringify({
      model_name: "tryon-v1.6",
      inputs: {
        model_image: toDataUrl(person),
        garment_image: toDataUrl(garment),
        category: "tops",
        garment_photo_type: "flat-lay",
        mode: "performance",
        output_format: "jpeg",
        return_base64: true,
        moderation_level: "conservative",
      },
    }),
    signal: AbortSignal.timeout(30_000),
  });
  const data = await response.json().catch(() => null) as { id?: string; error?: string; message?: string } | null;
  if (!response.ok || !data?.id) throw new TryOnError(data?.message ?? data?.error ?? "The AI fitting room could not start.", response.status || 502);
  return { id: data.id };
}

export async function generateTryOn(mode: TryOnMode, product: CatalogProduct & { tryOn: TryOnGarment }, personDataUrl: string): Promise<TryOnResult> {
  const [person, garment] = await Promise.all([preparePerson(personDataUrl), prepareGarment(product.tryOn)]);
  if (mode === "gradio") return runGradio(person, garment, product.tryOn.category);
  if (mode === "http") return runHttp(person, garment, product.tryOn.category);
  return runFashn(person, garment);
}
