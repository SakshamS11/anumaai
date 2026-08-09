import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function redirectWithMessage(request: NextRequest, key: "error" | "message", value: string) {
  const destination = new URL("/forgot-password", request.url);
  destination.searchParams.set(key, value);
  return NextResponse.redirect(destination, { status: 303 });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return redirectWithMessage(request, "error", "Enter your account email.");
  }

  const supabase = await createClient();
  const origin = new URL(request.url).origin;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return redirectWithMessage(
      request,
      "error",
      "We could not send the reset email right now. Please try again shortly.",
    );
  }

  return redirectWithMessage(
    request,
    "message",
    "If an ANUMA account exists for this email, a password reset link has been sent.",
  );
}
