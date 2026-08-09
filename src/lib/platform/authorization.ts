import "server-only";
import { notFound } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getPlatformEnvironment } from "@/lib/env";

export async function requirePlatformAdmin() {
  const user = await getAuthenticatedUser();
  if (!user?.email) notFound();
  const allowed = getPlatformEnvironment()
    .ANUMA_PLATFORM_ADMIN_EMAILS.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (!allowed.includes(user.email.toLowerCase())) notFound();
  return user;
}
