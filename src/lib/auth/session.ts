import { createClient } from "@/lib/supabase/server";

export type AuthenticatedUser = {
  id: string;
  email: string | null;
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    return null;
  }

  const userId = claimsData.claims.sub;
  if (typeof userId !== "string") {
    return null;
  }

  const email = claimsData.claims.email;
  return { id: userId, email: typeof email === "string" ? email : null };
}
