import "server-only";

export const ADMIN_SESSION_COOKIE = "adm_session";
export const ADMIN_COOKIE_PATH = "/admin";

export type AdminSession = {
  email: string;
  name: string;
  role: "owner";
  /** Expiry as a Unix timestamp in milliseconds. */
  exp: number;
};

const DEV_SECRET = "dev-only-admin-session-secret-change-me";

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV !== "production") return DEV_SECRET;
  return null;
}

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function hmacKey(key: string) {
  return crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export function adminAuthConfigured() {
  return secret() !== null;
}

export async function signAdminSession(session: AdminSession) {
  const key = secret();
  if (!key) throw new Error("ADMIN_SESSION_SECRET is not set");
  const body = toBase64Url(encoder.encode(JSON.stringify(session)));
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(key), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Returns the session when the token is authentic and unexpired, otherwise null. */
export async function verifyAdminSession(token: string | undefined): Promise<AdminSession | null> {
  const key = secret();
  if (!key || !token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  try {
    const valid = await crypto.subtle.verify("HMAC", await hmacKey(key), fromBase64Url(signature), encoder.encode(body));
    if (!valid) return null;
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as AdminSession;
    if (typeof session.exp !== "number" || session.exp <= Date.now()) return null;
    if (typeof session.email !== "string" || typeof session.name !== "string") return null;
    return session;
  } catch {
    return null;
  }
}
