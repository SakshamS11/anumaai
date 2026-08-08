import { expect, test } from "@playwright/test";

const protectedRoutes = [
  "/conversations",
  "/customer-intelligence",
  "/frontline-performance",
  "/outcome-intelligence",
  "/administration",
];

test("the unauthenticated entry point leads to sign-in", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { name: "Sign in to ANUMA" })).toBeVisible();
});

test("sign-in and sign-up expose real credential forms", async ({ page }) => {
  await page.goto("/sign-in");

  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("link", { name: "Create a development account" })).toBeVisible();

  await page.getByRole("link", { name: "Create a development account" }).click();
  await expect(page).toHaveURL(/\/sign-up$/);
  await expect(page.getByRole("button", { name: "Create development account" })).toBeVisible();
});

for (const route of protectedRoutes) {
  test(`unauthenticated users are redirected from ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/sign-in$/);
  });
}
