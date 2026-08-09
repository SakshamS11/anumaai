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

test("sign-in and workspace sign-up expose dedicated credential forms", async ({ page }) => {
  await page.goto("/sign-in");

  await expect(page.getByRole("heading", { name: "Sign in to ANUMA" })).toBeVisible();
  await expect(page.getByLabel("Work email")).toHaveAttribute("autocomplete", "email");
  await expect(page.locator('input[name="password"]')).toHaveAttribute(
    "autocomplete",
    "current-password",
  );
  await expect(page.getByRole("link", { name: "Forgot password?" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Create an ANUMA workspace" })).toBeVisible();

  await page.getByRole("link", { name: "Create an ANUMA workspace" }).click();
  await expect(page).toHaveURL(/\/sign-up$/);
  await expect(page.getByRole("button", { name: "Sign up" })).toBeVisible();
  await expect(page.getByText(/For organizations starting a new ANUMA environment/)).toBeVisible();
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
