export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext<"/api/try-on/status/[id]">) {
  const apiKey = process.env.FASHN_API_KEY;
  if (!apiKey) return Response.json({ error: "Virtual try-on is not configured." }, { status: 503 });
  const { id } = await context.params;
  if (!/^[a-zA-Z0-9-]{10,100}$/.test(id)) return Response.json({ error: "Invalid prediction ID." }, { status: 400 });
  const response = await fetch(`https://api.fashn.ai/v1/status/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" });
  const data = await response.json().catch(() => null);
  return Response.json(data ?? { error: "Invalid response from try-on service." }, { status: response.ok ? 200 : response.status });
}
