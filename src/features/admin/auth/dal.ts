import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "./session";

export const getAdminSession = cache(async () => {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSession(token);
});

/** Use at the top of every admin page and admin server action. */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
