"use server";

import { requireAdmin } from "@/features/admin/auth/dal";
import { configuredAdmin, safeEqual, usingDevCredentials } from "@/features/admin/auth/credentials";
import { clearFailures, lockoutSeconds, recordFailure } from "@/features/admin/auth/rate-limit";
import { EMAIL_PATTERN } from "@/features/admin/lib/settings-meta";

export type ProfileFormState = {
  status: "idle" | "preview" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  at?: number;
};

const PASSWORD_MIN = 10;

function invalid(fieldErrors: Record<string, string>, message = "Fix the highlighted fields and try again."): ProfileFormState {
  return { status: "error", message, fieldErrors, at: Date.now() };
}

export async function saveProfileAction(_previous: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const session = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Enter your name.";
  else if (name.length > 60) errors.name = "Keep your name under 60 characters.";
  if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
  if (Object.keys(errors).length > 0) return invalid(errors);

  const changes = [name !== session.name && "ADMIN_NAME", email !== session.email && "ADMIN_EMAIL"].filter(Boolean);
  if (changes.length === 0) return { status: "preview", message: "Nothing changed.", at: Date.now() };
  return {
    status: "preview",
    message: `Looks good. Your sign-in details live in environment variables for now: set ${changes.join(" and ")} on the server, then sign in again.`,
    at: Date.now(),
  };
}

export async function changePasswordAction(_previous: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const session = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const errors: Record<string, string> = {};
  if (!current) errors.current = "Enter your current password.";
  if (next.length < PASSWORD_MIN) errors.next = `Use at least ${PASSWORD_MIN} characters.`;
  else if (!/[a-zA-Z]/.test(next) || !/\d/.test(next)) errors.next = "Mix letters and numbers.";
  else if (next === current) errors.next = "Choose a password you haven't used here.";
  if (confirm !== next) errors.confirm = "The passwords don't match.";
  if (Object.keys(errors).length > 0) return invalid(errors);

  const admin = configuredAdmin();
  if (!admin) return { status: "error", message: "Sign-in isn't configured on this server.", at: Date.now() };

  const limitKey = `password:${session.email}`;
  const wait = lockoutSeconds(limitKey);
  if (wait > 0) return { status: "error", message: `Too many attempts. Try again in ${Math.ceil(wait / 60)} min.`, at: Date.now() };
  if (!safeEqual(current, admin.password)) {
    recordFailure(limitKey);
    return invalid({ current: "That isn't your current password." }, "Your current password didn't match.");
  }
  clearFailures(limitKey);

  return {
    status: "preview",
    message: usingDevCredentials()
      ? "New password checks out. You're using the built-in demo login: set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local to use your own."
      : "New password checks out. Set ADMIN_PASSWORD on the server to the new password, then sign in again.",
    at: Date.now(),
  };
}
