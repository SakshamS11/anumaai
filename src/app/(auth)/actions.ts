"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

function credentialsFrom(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

export async function signIn(formData: FormData) {
  const credentials = credentialsFrom(formData);

  if (!credentials.success) {
    redirect("/sign-in?error=Enter+a+valid+email+address+and+password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials.data);

  if (error) {
    redirect("/sign-in?error=We+could+not+sign+you+in.+Check+your+details+and+try+again.");
  }

  redirect("/conversations");
}

export async function signUp(formData: FormData) {
  const credentials = credentialsFrom(formData);

  if (!credentials.success) {
    redirect("/sign-up?error=Use+a+valid+email+address+and+a+password+of+at+least+8+characters.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(credentials.data);

  if (error) {
    redirect("/sign-up?error=We+could+not+create+your+account.+Check+your+details+and+try+again.");
  }

  if (!data.session) {
    redirect("/sign-up?message=Check+your+email+to+confirm+your+development+account.");
  }

  redirect("/conversations");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
