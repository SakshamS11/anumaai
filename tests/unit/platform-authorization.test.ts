import { afterEach, describe, expect, it, vi } from "vitest";

import { isPlatformAdminEmail } from "@/lib/platform/authorization";

afterEach(() => vi.unstubAllEnvs());

describe("internal platform authorization", () => {
  it("is closed when no platform operators are configured", () => {
    vi.stubEnv("ANUMA_PLATFORM_ADMIN_EMAILS", "");
    expect(isPlatformAdminEmail("founder@anuma.ai")).toBe(false);
  });

  it("matches configured operator emails case-insensitively", () => {
    vi.stubEnv("ANUMA_PLATFORM_ADMIN_EMAILS", " operations@anuma.ai, Founder@Anuma.ai ");
    expect(isPlatformAdminEmail("founder@anuma.ai")).toBe(true);
    expect(isPlatformAdminEmail("customer@example.com")).toBe(false);
  });
});
