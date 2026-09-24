export type LocalAccount = {
  name: string;
  email: string;
};

export const ACCOUNT_STORAGE_KEY = "hob-account-v1";

export function emptyAccount(): LocalAccount | null {
  return null;
}

export function parseAccount(raw: string | null): LocalAccount | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LocalAccount;
    if (
      !parsed ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      !parsed.name.trim() ||
      !parsed.email.trim()
    ) {
      return null;
    }
    return {
      name: parsed.name.trim(),
      email: parsed.email.trim(),
    };
  } catch {
    return null;
  }
}
