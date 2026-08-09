"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePlatformAdmin } from "@/lib/platform/authorization";
function slug(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70) || "organization"
  );
}
export async function createCustomerOrganization(formData: FormData) {
  await requirePlatformAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (name.length < 2 || !email.includes("@"))
    redirect(
      "/platform/organizations?error=Enter+an+organization+name+and+initial+administrator+email.",
    );
  const admin = createAdminClient();
  const existing = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const current = existing.data.users.find((u) => u.email?.toLowerCase() === email);
  let userId = current?.id;
  let invited = false;
  if (!userId) {
    const invite = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    });
    if (invite.error)
      redirect("/platform/organizations?error=The+initial+administrator+could+not+be+invited.");
    userId = invite.data.user.id;
    invited = true;
  }
  const inserted = await admin
    .from("organizations")
    .insert({
      name,
      slug: `${slug(name)}-${crypto.randomUUID().slice(0, 8)}`,
      country_code: String(formData.get("country") ?? "IN"),
      default_currency: String(formData.get("currency") ?? "INR"),
      timezone: String(formData.get("timezone") ?? "Asia/Kolkata"),
    })
    .select("id")
    .single();
  if (inserted.error || !inserted.data)
    redirect("/platform/organizations?error=The+organization+could+not+be+created.");
  const membership = await admin.from("organization_memberships").insert({
    organization_id: inserted.data.id,
    user_id: userId,
    role: "admin",
    status: "active",
  });
  if (membership.error)
    redirect(
      "/platform/organizations?error=The+organization+was+created+but+administrator+access+needs+attention.",
    );
  revalidatePath("/platform/organizations");
  redirect(`/platform/organizations?created=${invited ? "invited" : "created"}`);
}
