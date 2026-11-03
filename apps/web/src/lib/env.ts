import "server-only";

import { z } from "zod";

const optional = z
  .string()
  .optional()
  .transform((v) => (v ? v : undefined));

/** Env contract for the web app (ARCHITECTURE.md §9). */
const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  API_INTERNAL_URL: z.url(),
  INTERNAL_API_TOKEN: z.string().min(32),
  REVALIDATE_SECRET: z.string().min(32),
  SESSION_COOKIE_NAME: z.string().min(1).default("tb_session"),
  NEXT_PUBLIC_MEDIA_HOST: optional,
  NEXT_PUBLIC_GA_ID: optional,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optional,
});

export type WebEnv = z.infer<typeof envSchema>;

function parseEnv(): WebEnv {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const env = parseEnv();
