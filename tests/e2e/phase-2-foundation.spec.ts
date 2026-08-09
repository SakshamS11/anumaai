import { expect, test } from "@playwright/test";
import postgres from "postgres";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

test.describe.configure({ mode: "serial" });

const verificationId = crypto.randomUUID().slice(0, 8);
const email = `phase2.verify.${verificationId}@gmail.com`;
const password = `Anuma-${crypto.randomUUID()}!`;
const organizationName = `ANUMA Phase 2 Verification ${verificationId}`;
const locationName = `Verification Showroom ${verificationId}`;
const teamName = `Verification Team ${verificationId}`;
const conversationTitle = `Verification interaction ${verificationId}`;

test.afterAll(async () => {
  process.loadEnvFile(".env.local");
  const databaseUrl = process.env.SUPABASE_DB_URL;
  if (!databaseUrl) return;

  const sql = postgres(databaseUrl, { max: 1, prepare: false });
  try {
    const users = await sql<{ id: string }[]>`select id from auth.users where email = ${email}`;
    for (const user of users) {
      const memberships = await sql<{ organization_id: string }[]>`
        select organization_id
        from public.organization_memberships
        where user_id = ${user.id}::uuid
      `;
      for (const membership of memberships) {
        await sql`
          delete from public.conversations
          where organization_id = ${membership.organization_id}::uuid
        `;
        await sql`
          delete from public.organizations
          where id = ${membership.organization_id}::uuid
        `;
      }
      await sql`delete from auth.users where id = ${user.id}::uuid`;
    }
  } finally {
    await sql.end();
  }
});

async function createDevelopmentAccount() {
  process.loadEnvFile(".env.local");
  const databaseUrl = process.env.SUPABASE_DB_URL;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!databaseUrl || !url || !secret) {
    throw new Error(
      "SUPABASE_DB_URL, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SECRET_KEY are required for browser verification.",
    );
  }

  const { data, error } = await createSupabaseClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  }).auth.admin.createUser({ email, email_confirm: true, password });
  if (error || !data.user)
    throw new Error(`Browser test user could not be created: ${error?.message}`);
}

test("authenticated interaction foundation persists and presents the Phase 3 audio entry point", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "The hosted Auth journey runs once; viewport coverage is deterministic.",
  );
  test.setTimeout(60_000);
  const consoleErrors: string[] = [];
  const failedResponses: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  await createDevelopmentAccount();
  await page.goto("/sign-in");
  await page.getByLabel("Work email").fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/setup$/);
  await expect(page.getByRole("heading", { name: "Set up your ANUMA workspace" })).toBeVisible();
  await page.getByLabel("Organization name").fill(organizationName);
  await page.getByLabel("Country").selectOption("IN");
  await page.getByLabel("Default currency").selectOption("INR");
  await page.getByLabel("Display timezone").selectOption("Asia/Kolkata");
  await page.getByRole("button", { name: "Create organization" }).click();

  await expect(page).toHaveURL(/\/administration\?created=organization$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Administration", exact: true })).toBeVisible();
  await expect(page.getByText("Organization created", { exact: false })).toBeVisible();

  await page.getByRole("link", { name: "Structure", exact: true }).first().click();
  await page.getByRole("button", { name: "Add location" }).click();
  const locationDialog = page.getByRole("dialog").filter({ hasText: "Add location" });
  await locationDialog.getByLabel("Name", { exact: true }).fill(locationName);
  await locationDialog.getByLabel("Type").selectOption("showroom");
  await locationDialog.getByRole("button", { name: "Add location" }).click();
  await expect(page.getByText(locationName, { exact: false })).toBeVisible();

  await page.getByRole("button", { name: "Add team" }).click();
  const teamDialog = page.getByRole("dialog").filter({ hasText: "Add team" });
  await teamDialog.getByLabel("Team name").fill(teamName);
  await teamDialog.getByRole("button", { name: "Add team" }).click();
  await expect(page.getByText(teamName, { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Conversations" }).first().click();
  await page.getByLabel("Interaction label (optional)").fill(conversationTitle);
  await page.getByLabel("Vertical").selectOption("automotive");
  await page.getByLabel("Location").selectOption({ label: locationName });
  await page.getByLabel("Team").selectOption({ label: teamName });
  await page.getByLabel("Customer recording consent").selectOption("granted");
  await page.getByLabel("How was consent captured?").selectOption("verbal");
  await page.getByRole("button", { name: "Create interaction" }).click();

  await expect(page.getByRole("heading", { name: conversationTitle })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Add the interaction audio" })).toBeVisible();
  await expect(page.getByText("Select audio file")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: conversationTitle })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("navigation", { name: "Primary navigation on small screens" }),
  ).toBeVisible();

  await page.getByLabel("Open user menu").click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/administration");
  await expect(page).toHaveURL(/\/sign-in$/);
  expect({ consoleErrors, failedResponses }).toEqual({ consoleErrors: [], failedResponses: [] });
});
