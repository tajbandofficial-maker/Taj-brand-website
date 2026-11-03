import { validateEnv } from "./env.schema.js";

const valid = {
  DATABASE_URL: "mysql://taj:taj@localhost:3306/tajband",
  JWT_SECRET: "x".repeat(64),
  INTERNAL_API_TOKEN: "y".repeat(32),
  WEB_INTERNAL_URL: "http://localhost:3000",
  REVALIDATE_SECRET: "z".repeat(32),
  PUBLIC_SITE_URL: "http://localhost:3000",
};

describe("validateEnv", () => {
  it("accepts a minimal development config and applies defaults", () => {
    const env = validateEnv(valid);
    expect(env.PORT).toBe(4000);
    expect(env.NODE_ENV).toBe("development");
    expect(env.SWAGGER_ENABLED).toBe(false);
  });

  it("treats empty strings as unset", () => {
    expect(validateEnv({ ...valid, R2_PUBLIC_BASE_URL: "" }).R2_PUBLIC_BASE_URL).toBeUndefined();
  });

  it("rejects short secrets", () => {
    expect(() => validateEnv({ ...valid, JWT_SECRET: "short" })).toThrow(/JWT_SECRET/);
  });

  it("requires email in production; storage is all-or-nothing; Cloudflare/Turnstile optional", () => {
    const mail = { SMTP_USER: "band@gmail.com", SMTP_PASS: "app-password" };
    const base = { ...valid, ...mail, NODE_ENV: "production", BUSINESS_EMAIL: "band@gmail.com" };
    expect(() => validateEnv({ ...valid, NODE_ENV: "production" })).toThrow(/SMTP_USER/);
    // No storage at all: allowed (uploads disabled).
    expect(validateEnv(base).R2_BUCKET).toBeUndefined();
    // Half-configured storage: rejected.
    expect(() => validateEnv({ ...base, R2_ACCOUNT_ID: "abc" })).toThrow(/R2_BUCKET/);
    const prod = validateEnv({
      ...valid,
      NODE_ENV: "production",
      R2_ACCESS_KEY_ID: "key",
      R2_SECRET_ACCESS_KEY: "secret",
      R2_BUCKET: "taj-media",
      R2_PUBLIC_BASE_URL: "https://s3.example.com/taj-media",
      R2_ENDPOINT: "http://storage:9000",
      SMTP_USER: "band@gmail.com",
      SMTP_PASS: "app-password",
      BUSINESS_EMAIL: "band@gmail.com",
    });
    expect(prod.CLOUDFLARE_ZONE_ID).toBeUndefined();
  });

  it("allows a short seed admin password only outside production", () => {
    expect(validateEnv({ ...valid, SEED_ADMIN_PASSWORD: "admin" }).SEED_ADMIN_PASSWORD).toBe(
      "admin",
    );
    expect(() =>
      validateEnv({ ...valid, NODE_ENV: "production", SEED_ADMIN_PASSWORD: "admin" }),
    ).toThrow(/SEED_ADMIN_PASSWORD/);
  });
});
