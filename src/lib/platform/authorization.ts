import "server-only";
import { notFound } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getPlatformEnvironment } from "@/lib/env";

export function isPlatformAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const configured = process.env.ANUMA_PLATFORM_ADMIN_EMAILS;
  if (!configured) return false;
  return configured
    .split(",")
    .map((candidate) => candidate.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

export async function requirePlatformAdmin() {
  const user = await getAuthenticatedUser();
  if (!user?.email) notFound();
  getPlatformEnvironment();
  if (!isPlatformAdminEmail(user.email)) notFound();
  return user;
}
