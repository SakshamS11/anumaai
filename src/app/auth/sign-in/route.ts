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

  if (!email || !password) {
    return redirectWithMessage(request, "/sign-in", "error", "Enter your email and password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return redirectWithMessage(
      request,
      "/sign-in",
      "error",
      "We could not sign you in. Check your password or use Forgot password.",
    );
  }

  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
