import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

/** Used only in local development when ADMIN_EMAIL / ADMIN_PASSWORD are not set. */
export const DEV_ADMIN = {
  email: "owner@demo.store",
  password: "atelier-demo",
  name: "Store Owner",
} as const;

type AdminAccount = { email: string; password: string; name: string };

export function configuredAdmin(): AdminAccount | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    return { email, password, name: process.env.ADMIN_NAME?.trim() || "Store Owner" };
  }
  if (process.env.NODE_ENV !== "production") return { ...DEV_ADMIN };
  return null;
}

export function usingDevCredentials() {
  return process.env.NODE_ENV !== "production" && !(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

/** Constant-time comparison that also hides length differences. */
export function safeEqual(a: string, b: string) {
  return timingSafeEqual(digest(a), digest(b));
}
