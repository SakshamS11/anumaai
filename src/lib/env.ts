import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL."),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required."),
});

const trustedServerEnvironmentSchema = publicEnvironmentSchema.extend({
  SUPABASE_SECRET_KEY: z.string().min(1, "SUPABASE_SECRET_KEY is required on the server."),
  SARVAM_API_KEY: z.string().min(1, "SARVAM_API_KEY is required on the server."),
});

const openAIEnvironmentSchema = trustedServerEnvironmentSchema.extend({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required on the server."),
  ANUMA_ANALYSIS_MODEL: z.literal("gpt-5.6-luna").default("gpt-5.6-luna"),
});

export type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>;

export function parsePublicEnvironment(
  source: Record<string, string | undefined>,
): PublicEnvironment {
  return publicEnvironmentSchema.parse(source);
}

export function getPublicEnvironment(): PublicEnvironment {
  return parsePublicEnvironment({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}

export type TrustedServerEnvironment = z.infer<typeof trustedServerEnvironmentSchema>;

export function getTrustedServerEnvironment(): TrustedServerEnvironment {
  return trustedServerEnvironmentSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    SARVAM_API_KEY: process.env.SARVAM_API_KEY,
  });
}

export type OpenAIEnvironment = z.infer<typeof openAIEnvironmentSchema>;

export function getOpenAIEnvironment(): OpenAIEnvironment {
  return openAIEnvironmentSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    SARVAM_API_KEY: process.env.SARVAM_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANUMA_ANALYSIS_MODEL: process.env.ANUMA_ANALYSIS_MODEL,
  });
}
