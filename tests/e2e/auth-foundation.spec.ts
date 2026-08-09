import { expect, test } from "@playwright/test";

const protectedRoutes = [
  "/conversations",
  "/customer-intelligence",
  "/frontline-performance",
  "/outcome-intelligence",
  "/administration",
];

test("the public entry point explains ANUMA and links to access routes", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", {
      name: "Every conversation leaves a signal. ANUMA turns it into intelligence.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "See ANUMA in action" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in", exact: true }).first()).toBeVisible();
});

test("the public mobile menu is keyboard accessible and closes after navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menu = page.locator(".public-menu-trigger");
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.locator(".public-mobile-menu").getByRole("link", { name: "How it works" }).click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("the public mobile menu closes with Escape and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menu = page.locator(".public-menu-trigger");
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();
});

test("illustrative findings expose their exact source by keyboard and touch", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const competitor = page.getByRole("button", { name: "COMPETITOR Amazon · ₹78,000" });
  await competitor.focus();
  await expect(competitor).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("mark")).toHaveText("Amazon pe LOQ ₹78,000");

  const budget = page.getByRole("button", { name: "BUDGET ₹80,000" });
  await budget.click();
  await expect(budget).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("mark")).toHaveText("Budget around ₹80,000 hai");
});

test("sign-in and workspace sign-up expose dedicated credential forms", async ({ page }) => {
  await page.goto("/sign-in");

  await expect(page.getByRole("heading", { name: "Sign in to ANUMA" })).toBeVisible();
  await expect(page.getByLabel("Work email")).toHaveAttribute("autocomplete", "email");
  await expect(page.locator('input[name="password"]')).toHaveAttribute(
    "autocomplete",
    "current-password",
  );
  await expect(page.getByRole("link", { name: "Forgot password?" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign up", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.locator('input[name="password"]')).toHaveAttribute("type", "text");

  await page.getByRole("link", { name: "Sign up", exact: true }).click();
  await expect(page).toHaveURL(/\/sign-up$/);
  await expect(page.getByRole("heading", { name: "Sign up to ANUMA" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign up" })).toBeVisible();
  await expect(page.getByText(/For organizations starting a new ANUMA environment/)).toBeVisible();
  await expect(page.getByText("Invited by your organization?")).toBeVisible();
});

test("recovery pages remain branded, labelled, and recoverable", async ({ page }) => {
  await page.goto("/forgot-password");
  await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to sign in" })).toBeVisible();

  await page.goto("/reset-password");
  await expect(page.getByLabel("New password", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Confirm new password", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Show password" }).first().click();
  await expect(page.getByLabel("New password", { exact: true })).toHaveAttribute("type", "text");
});

test("expired auth fragments become a safe ANUMA invitation error", async ({ page }) => {
  await page.goto(
    "/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired",
  );
  await expect(page).toHaveURL(/\/auth\/invite\?auth_error=expired$/);
  await expect(page.getByRole("heading", { name: "This invitation has expired" })).toBeVisible();
  await expect(page.getByText(/Supabase|OTP|JWT|RPC/)).toHaveCount(0);
});

test("an invitation cannot be accepted without a valid application credential", async ({
  page,
}) => {
  await page.goto("/auth/invite");
  await expect(
    page.getByRole("heading", { name: "This invitation is no longer valid" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to sign in" })).toBeVisible();
});

test("customer users cannot discover the internal platform surface", async ({ page }) => {
  const response = await page.goto("/platform");
  expect(response?.status()).toBe(404);
});

for (const route of protectedRoutes) {
  test(`unauthenticated users are redirected from ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/sign-in$/);
  });
}
