import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function redirectWithMessage(request: NextRequest, path: string, key: "error" | "message", value: string) {
  const destination = new URL(path, request.url);
  destination.searchParams.set(key, value);
  return NextResponse.redirect(destination, { status: 303 });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || password.length < 8) {
    return redirectWithMessage(
      request,
      "/sign-up",
      "error",
      "Enter a valid email and a password with at least 8 characters.",
    );
  }

  const supabase = await createClient();
  const origin = new URL(request.url).origin;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/setup`,
    },
  });

  if (error) {
    return redirectWithMessage(
      request,
      "/sign-up",
      "error",
      "We could not create your account. If you already registered, sign in or reset your password.",
    );
  }

  if (!data.session) {
    return redirectWithMessage(
      request,
      "/sign-up",
      "message",
      "Check your email to confirm your account. If you already registered, use Sign in or Forgot password instead.",
    );
  }

  return NextResponse.redirect(new URL("/setup", request.url), { status: 303 });
}
