import { expect, test } from "@playwright/test";
import postgres from "postgres";

test.describe.configure({ mode: "serial" });

const verificationId = crypto.randomUUID().slice(0, 8);
const userId = crypto.randomUUID();
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
  if (!databaseUrl) throw new Error("SUPABASE_DB_URL is required for browser verification.");

  const sql = postgres(databaseUrl, { max: 1, prepare: false });
  try {
    await sql`
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, confirmation_token, recovery_token,
        email_change_token_new, email_change
      ) values (
        '00000000-0000-0000-0000-000000000000'::uuid,
        ${userId}::uuid,
        'authenticated',
        'authenticated',
        ${email},
        extensions.crypt(${password}, extensions.gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        now(),
        now(),
        '',
        '',
        '',
        ''
      )
    `;
    await sql`
      insert into auth.identities (
        provider_id, user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) values (
        ${userId}::text,
        ${userId}::uuid,
        jsonb_build_object(
          'sub', ${userId}::text,
          'email', ${email}::text,
          'email_verified', true
        ),
        'email',
        now(),
        now(),
        now()
      )
    `;
  } finally {
    await sql.end();
  }
}

test("authenticated interaction foundation persists and presents the Phase 3 audio entry point", async ({
  page,
}) => {
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
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/setup$/);
  await expect(page.getByRole("heading", { name: "Create your ANUMA organization" })).toBeVisible();
  await page.getByLabel("Organization name").fill(organizationName);
  await page.getByLabel("Country").selectOption("IN");
  await page.getByLabel("Default currency").selectOption("INR");
  await page.getByLabel("Display timezone").selectOption("Asia/Kolkata");
  await page.getByRole("button", { name: "Create organization" }).click();

  await expect(page).toHaveURL(/\/administration\?created=organization$/);
  await expect(page.getByText(organizationName, { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Admin", exact: true })).toBeVisible();

  await page.getByLabel("Name", { exact: true }).fill(locationName);
  await page.getByLabel("Type").selectOption("showroom");
  await page.getByRole("button", { name: "Add location" }).click();
  await expect(page.getByText(locationName, { exact: true })).toBeVisible();

  await page.getByLabel("Team name").fill(teamName);
  await page.getByRole("button", { name: "Add team" }).click();
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
