import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createInvitationCredential,
  hashInvitationCredential,
  invitationSiteUrl,
  parseInvitationOtpType,
  safeInvitationMessage,
} from "@/modules/identity/invitations";

afterEach(() => vi.unstubAllEnvs());

describe("organization invitation credentials", () => {
  it("stores a stable SHA-256 hash rather than the raw credential", () => {
    const credential = createInvitationCredential();

    expect(credential.rawToken).not.toBe(credential.tokenHash);
    expect(credential.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(hashInvitationCredential(credential.rawToken)).toBe(credential.tokenHash);
  });

  it("accepts only the two Supabase email verification types used by invitations", () => {
    expect(parseInvitationOtpType("invite")).toBe("invite");
    expect(parseInvitationOtpType("magiclink")).toBe("magiclink");
    expect(parseInvitationOtpType("recovery")).toBeNull();
    expect(parseInvitationOtpType(null)).toBeNull();
  });

  it("uses the configured public origin without a trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://anumaai-ten.vercel.app/");
    expect(invitationSiteUrl()).toBe("https://anumaai-ten.vercel.app");
  });

  it("maps database failures to safe product language", () => {
    expect(safeInvitationMessage("foreign key constraint failed")).not.toMatch(/foreign key/i);
    expect(safeInvitationMessage("invitation expired")).toBe("This invitation has expired.");
  });
});
