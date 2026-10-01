"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { configuredAdmin, safeEqual } from "./credentials";
import { clearFailures, lockoutSeconds, recordFailure } from "./rate-limit";
import {
  ADMIN_COOKIE_PATH,
  ADMIN_SESSION_COOKIE,
  adminAuthConfigured,
  signAdminSession,
} from "./session";

export type LoginState = {
  error?: string;
  fieldErrors?: { email?: string; password?: string };
  email?: string;
};

const SHORT_SESSION_MS = 12 * 60 * 60 * 1000;
const LONG_SESSION_MS = 30 * 24 * 60 * 60 * 1000;

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/admin") && !next.startsWith("/admin/login") && !next.startsWith("//") ? next : "/admin";
}

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  const fieldErrors: LoginState["fieldErrors"] = {};
  if (!email) fieldErrors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (!password) fieldErrors.password = "Enter your password.";
  if (fieldErrors.email || fieldErrors.password) return { fieldErrors, email };

  const admin = configuredAdmin();
  if (!admin || !adminAuthConfigured()) {
    return { error: "Admin sign-in is not configured on this server yet.", email };
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "local";
  const limitKey = `${ip}:${email}`;
  const wait = lockoutSeconds(limitKey);
  if (wait > 0) {
    return { error: `Too many attempts. Try again in ${Math.ceil(wait / 60)} min.`, email };
  }

  const emailMatches = safeEqual(email, admin.email);
  const passwordMatches = safeEqual(password, admin.password);
  if (!emailMatches || !passwordMatches) {
    recordFailure(limitKey);
    return { error: "That email and password don't match our records.", email };
  }
  clearFailures(limitKey);

  const lifetime = remember ? LONG_SESSION_MS : SHORT_SESSION_MS;
  const token = await signAdminSession({
    email: admin.email,
    name: admin.name,
    role: "owner",
    exp: Date.now() + lifetime,
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: ADMIN_COOKIE_PATH,
    ...(remember ? { maxAge: lifetime / 1000 } : {}),
  });

  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: ADMIN_SESSION_COOKIE, path: ADMIN_COOKIE_PATH });
  redirect("/admin/login");
}
