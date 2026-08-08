"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createAuthActionClient } from "@/lib/supabase/server";

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

function reportAuthStage(stage: string, error?: unknown) {
  const details =
    error && typeof error === "object"
      ? {
          code: "code" in error && typeof error.code === "string" ? error.code : null,
          message: "message" in error && typeof error.message === "string" ? error.message : null,
          name: "name" in error && typeof error.name === "string" ? error.name : null,
        }
      : undefined;
  console.info("ANUMA authentication", { ...details, stage });
}

export async function signIn(formData: FormData) {
  const credentials = credentialsFrom(formData);

  if (!credentials.success) {
    redirect("/sign-in?error=Enter+a+valid+email+address+and+password.");
  }

  let result;
  try {
    reportAuthStage("auth_signin_start");
    const supabase = await createAuthActionClient();
    reportAuthStage("supabase_client_created");
    result = await supabase.auth.signInWithPassword(credentials.data);
    reportAuthStage("supabase_signin_returned", result.error);
  } catch (error) {
    reportAuthStage("auth_cookie_write_failed", error);
    redirect("/sign-in?error=We+could+not+sign+you+in.+Please+try+again.");
  }

  if (result.error) {
    redirect("/sign-in?error=We+could+not+sign+you+in.+Check+your+details+and+try+again.");
  }

  reportAuthStage("signin_redirect");
  redirect("/conversations");
}

export async function signUp(formData: FormData) {
  const credentials = credentialsFrom(formData);

  if (!credentials.success) {
    redirect("/sign-up?error=Use+a+valid+email+address+and+a+password+of+at+least+8+characters.");
  }

  let result;
  try {
    reportAuthStage("auth_signup_start");
    const supabase = await createAuthActionClient();
    reportAuthStage("supabase_client_created");
    result = await supabase.auth.signUp(credentials.data);
    reportAuthStage("supabase_signup_returned", result.error);
  } catch (error) {
    reportAuthStage("auth_cookie_write_failed", error);
    redirect("/sign-up?error=We+could+not+create+your+account.+Please+try+again.");
  }

  if (result.error) {
    redirect("/sign-up?error=We+could+not+create+your+account.+Check+your+details+and+try+again.");
  }

  reportAuthStage(result.data.session ? "signup_has_session" : "signup_confirmation_required");
  if (!result.data.session) {
    redirect("/sign-up?message=Check+your+email+to+confirm+your+account.");
  }

  reportAuthStage("signup_redirect");
  redirect("/setup");
}

export async function signOut() {
  const supabase = await createAuthActionClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
