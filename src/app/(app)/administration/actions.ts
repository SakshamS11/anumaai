"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getApplicationContext } from "@/modules/identity/application-context";
import { locationSchema, teamSchema } from "@/modules/organizations/validation";
import { z } from "zod";

const organizationCheckSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().min(2).max(1000),
    purpose: z.enum(["monitor", "scorecard"]),
    applicability: z.enum(["every_interaction", "when_relevant"]),
    evaluationStrategy: z.enum(["semantic", "phrase"]),
    phrase: z.string().trim().max(200).optional(),
    weight: z.coerce.number().positive().optional(),
  })
  .superRefine((value, context) => {
    if (value.evaluationStrategy === "phrase" && !value.phrase) {
      context.addIssue({ code: "custom", message: "An exact phrase is required." });
    }
    if (value.purpose === "scorecard" && !value.weight) {
      context.addIssue({ code: "custom", message: "A score weight is required." });
    }
  });

export async function createLocation(formData: FormData) {
  const context = await getApplicationContext();
  if (!context) redirect("/sign-in");
  if (!context.current) redirect("/setup");
  if (context.current.membership.role !== "admin") {
    redirect("/administration?error=Administrator+access+is+required.");
  }

  const input = locationSchema.safeParse({
    name: formData.get("name"),
    businessCode: formData.get("business_code") || undefined,
    locationType: formData.get("location_type"),
    timezone: formData.get("timezone") || undefined,
  });
  if (!input.success) redirect("/administration/structure?error=Check+the+location+details.");

  const supabase = await createClient();
  const { error } = await supabase.from("locations").insert({
    organization_id: context.current.organization.id,
    name: input.data.name,
    business_code: input.data.businessCode || null,
    location_type: input.data.locationType,
    timezone: input.data.timezone || null,
  });
  if (error) redirect("/administration/structure?error=The+location+could+not+be+created.");

  revalidatePath("/administration/structure");
  redirect("/administration/structure?created=location");
}

export async function createTeam(formData: FormData) {
  const context = await getApplicationContext();
  if (!context) redirect("/sign-in");
  if (!context.current) redirect("/setup");
  if (context.current.membership.role !== "admin") {
    redirect("/administration?error=Administrator+access+is+required.");
  }

  const input = teamSchema.safeParse({ name: formData.get("name") });
  if (!input.success) redirect("/administration/structure?error=Check+the+team+name.");

  const supabase = await createClient();
  const { error } = await supabase.from("teams").insert({
    organization_id: context.current.organization.id,
    name: input.data.name,
  });
  if (error) redirect("/administration/structure?error=The+team+could+not+be+created.");

  revalidatePath("/administration/structure");
  redirect("/administration/structure?created=team");
}

async function requireAdmin() {
  const context = await getApplicationContext();
  if (!context) redirect("/sign-in");
  if (!context.current) redirect("/setup");
  if (context.current.membership.role !== "admin") {
    redirect("/administration?error=Administrator+access+is+required.");
  }
  return context.current;
}

export async function seedStarterElectronicsChecks() {
  const current = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("seed_starter_electronics_checks", {
    p_organization_id: current.organization.id,
  });
  if (error) redirect("/administration/checks?error=Starter+checks+could+not+be+created.");
  revalidatePath("/administration/checks");
  redirect("/administration/checks?created=starter+checks");
}

export async function createOrganizationCheck(formData: FormData) {
  const current = await requireAdmin();
  const parsed = organizationCheckSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    purpose: formData.get("purpose"),
    applicability: formData.get("applicability"),
    evaluationStrategy: formData.get("evaluation_strategy"),
    phrase: formData.get("phrase") || undefined,
    weight: formData.get("weight") || undefined,
  });
  if (!parsed.success) redirect("/administration/checks?error=Check+the+new+check+details.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_organization_check", {
    p_applicability: parsed.data.applicability,
    p_description: parsed.data.description,
    p_evaluation_strategy: parsed.data.evaluationStrategy,
    p_name: parsed.data.name,
    p_organization_id: current.organization.id,
    p_phrase: parsed.data.evaluationStrategy === "phrase" ? parsed.data.phrase : undefined,
    p_purpose: parsed.data.purpose,
    p_weight: parsed.data.purpose === "scorecard" ? parsed.data.weight : undefined,
  });
  if (error) redirect("/administration/checks?error=The+check+could+not+be+created.");
  revalidatePath("/administration/checks");
  redirect("/administration/checks?created=check");
}
