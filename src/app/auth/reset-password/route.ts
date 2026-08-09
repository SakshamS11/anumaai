import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function redirectWithError(request: NextRequest, value: string) {
  const destination = new URL("/reset-password", request.url);
  destination.searchParams.set("error", value);
  return NextResponse.redirect(destination, { status: 303 });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return redirectWithError(request, "Use a password with at least 8 characters.");
  }

  if (password !== confirmPassword) {
    return redirectWithError(request, "The passwords do not match.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return redirectWithError(
      request,
      "This reset session is invalid or has expired. Request a new reset link.",
    );
  }

  return NextResponse.redirect(new URL("/setup", request.url), { status: 303 });
}
