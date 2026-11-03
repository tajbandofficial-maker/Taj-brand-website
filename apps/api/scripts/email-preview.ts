/**
 * Renders the inquiry emails with the real Site settings and a sample enquiry
 * into email-previews/*.html — open them in a browser to check the design.
 *   pnpm --filter api email:preview   → write the HTML files
 *   pnpm --filter api email:test      → also send both to BUSINESS_EMAIL
 * Needs the database (`pnpm db:up`).
 */
import "dotenv/config";

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { ConfigService } from "@nestjs/config";

import { type Env, validateEnv } from "../src/config/env.schema.js";
import { type Inquiry, InquiryStatus, PrismaClient } from "../src/generated/prisma/client.js";
import {
  clientInquiryEmail,
  teamInquiryEmail,
} from "../src/modules/notifications/inquiry-emails.js";
import { Mailer, withInlineLogo } from "../src/modules/notifications/mailer.js";
import { NotificationsService } from "../src/modules/notifications/notifications.service.js";
import { createMariaDbAdapter } from "../src/prisma/mariadb.js";
import type { PrismaService } from "../src/prisma/prisma.service.js";

const prisma = new PrismaClient({
  adapter: createMariaDbAdapter(process.env.DATABASE_URL!),
});

const sample: Inquiry = {
  id: "preview",
  name: "Riya Malhotra",
  phone: "919876543210",
  email: "riya@example.com",
  weddingDate: new Date("2026-12-12"),
  venue: "The Leela Ambience, Gurugram",
  services: ["brass-band-baraat", "dhol-players", "dj-on-wheels"],
  message:
    "Around 250 guests. Baraat starts at 8 pm — we'd love umbrella lights and a vintage car.",
  sourcePage: "/contact",
  ip: null,
  status: InquiryStatus.NEW,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function main() {
  // Same validation + defaults as the API, so a test send behaves like production.
  const env = validateEnv(process.env);
  const config = { get: (key: keyof Env) => env[key] } as unknown as ConfigService<Env, true>;
  const notifications = new NotificationsService(config, prisma as unknown as PrismaService);
  const input = { inquiry: sample, ...(await notifications.context(sample)) };

  const out = join(import.meta.dirname, "..", "email-previews");
  mkdirSync(out, { recursive: true });
  const mails = [
    ["inquiry-to-client.html", clientInquiryEmail(input)],
    ["inquiry-to-team.html", teamInquiryEmail(input)],
  ] as const;
  for (const [file, mail] of mails) {
    writeFileSync(join(out, file), mail.html);
    console.log(`✓ ${file} — “${mail.subject}”`);
  }

  if (!process.argv.includes("--send")) return;
  const mailer = Mailer.fromConfig(config);
  const to = env.BUSINESS_EMAIL;
  if (!mailer || !to) {
    throw new Error(`Can't send: ${to ? Mailer.setupHint : "set BUSINESS_EMAIL"}`);
  }
  const from = mailer.from(input.brand.name);
  // Sent copies carry the logo as an inline attachment (the HTML files keep the URL).
  const sendInput = { ...input, brand: withInlineLogo(input.brand) };
  for (const mail of [clientInquiryEmail(sendInput), teamInquiryEmail(sendInput)]) {
    await mailer.send(from, { ...mail, subject: `[TEST] ${mail.subject}`, to: [to] });
  }
  console.log(`✉ Sent both test emails to ${to} via ${mailer.kind} (from ${from})`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
