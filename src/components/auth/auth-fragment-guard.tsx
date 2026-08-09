"use client";

import { useEffect } from "react";

export function AuthFragmentGuard() {
  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const code = fragment.get("error_code");
    if (!fragment.get("error") && !code) return;
    const destination = new URL("/auth/invite", window.location.origin);
    destination.searchParams.set("auth_error", code === "otp_expired" ? "expired" : "invalid");
    window.location.replace(destination);
  }, []);

  return null;
}
