import { z } from "zod";

const secret = (min: number) => z.string().min(min, `must be at least ${min} characters`);

/**
 * Env contract for the API (ARCHITECTURE.md §9). Validated once at boot; the
 * process refuses to start if anything is missing or malformed.
 *
 * Third-party credentials (Cloudflare, Turnstile, R2, Resend) are optional in
 * development so the app can boot locally without them, but required in production.
 */
export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.url(),
    JWT_SECRET: secret(32),
    INTERNAL_API_TOKEN: secret(32),
    WEB_INTERNAL_URL: z.url(),
    REVALIDATE_SECRET: secret(32),
    PUBLIC_SITE_URL: z.url(),

    CLOUDFLARE_ZONE_ID: z.string().optional(),
    CLOUDFLARE_API_TOKEN: z.string().optional(),
    TURNSTILE_SECRET_KEY: z.string().optional(),
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET: z.string().optional(),
    R2_PUBLIC_BASE_URL: z.url().optional(),
    /** Override the S3 endpoint (dev: the local RustFS container). Defaults to R2's. */
    R2_ENDPOINT: z.url().optional(),
    /**
     * Browser-facing S3 endpoint for presigned uploads when R2_ENDPOINT is internal
     * (self-hosted: R2_ENDPOINT=http://storage:9000, R2_PUBLIC_ENDPOINT=https://s3.<domain>).
     */
    R2_PUBLIC_ENDPOINT: z.url().optional(),
    /** Email transport 1 — SMTP, e.g. Gmail with an App Password (preferred when set). */
    SMTP_HOST: z.string().default("smtp.gmail.com"),
    SMTP_PORT: z.coerce.number().int().positive().default(465),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    /** Email transport 2 — Resend HTTP API (needs MAIL_FROM on a verified domain). */
    RESEND_API_KEY: z.string().optional(),
    /** Sender, e.g. "Taj Band <hello@example.com>". Optional with SMTP (defaults to SMTP_USER). */
    MAIL_FROM: z.string().optional(),
    /** Our inbox: shown in emails, receives client replies, default alert recipient. */
    BUSINESS_EMAIL: z.email().optional(),
    INQUIRY_NOTIFY_EMAILS: z.string().optional(),

    SEED_ADMIN_EMAIL: z.email().optional(),
    /** Any length locally; 12+ characters in production (checked below). */
    SEED_ADMIN_PASSWORD: z.string().optional(),
    SWAGGER_ENABLED: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== "production") return;
    if (env.SEED_ADMIN_PASSWORD !== undefined && env.SEED_ADMIN_PASSWORD.length < 12) {
      ctx.addIssue({
        code: "custom",
        path: ["SEED_ADMIN_PASSWORD"],
        message: "must be at least 12 characters in production",
      });
    }
    // Cloudflare purge and Turnstile stay optional: the site works without them (VPS-only setup).
    const requiredInProd = [
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET",
      "R2_PUBLIC_BASE_URL",
    ] as const;
    if (!env.R2_ENDPOINT && !env.R2_ACCOUNT_ID) {
      ctx.addIssue({
        code: "custom",
        path: ["R2_ENDPOINT"],
        message:
          "set R2_ENDPOINT (self-hosted storage) or R2_ACCOUNT_ID (Cloudflare R2) in production",
      });
    }
    const smtp = Boolean(env.SMTP_USER && env.SMTP_PASS);
    const resend = Boolean(env.RESEND_API_KEY && env.MAIL_FROM);
    if (!smtp && !resend) {
      ctx.addIssue({
        code: "custom",
        path: ["SMTP_USER"],
        message: "set SMTP_USER + SMTP_PASS, or RESEND_API_KEY + MAIL_FROM, in production",
      });
    }
    if (!env.INQUIRY_NOTIFY_EMAILS && !env.BUSINESS_EMAIL) {
      ctx.addIssue({
        code: "custom",
        path: ["BUSINESS_EMAIL"],
        message: "set BUSINESS_EMAIL or INQUIRY_NOTIFY_EMAILS in production",
      });
    }
    for (const key of requiredInProd) {
      if (!env[key]) {
        ctx.addIssue({ code: "custom", path: [key], message: "required in production" });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  // Empty strings from .env files (e.g. `R2_BUCKET=`) mean "not set".
  const cleaned = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== ""));
  const result = envSchema.safeParse(cleaned);
  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
