import { readFileSync } from "node:fs";

import type { ConfigService } from "@nestjs/config";
import { createTransport, type Transporter } from "nodemailer";

import type { Env } from "../../config/env.schema.js";
import type { EmailBrand } from "./email-layout.js";
import type { Email } from "./inquiry-emails.js";

export type Message = Email & { to: string[]; replyTo?: string | null };

/**
 * The logo travels inside the email as an inline (cid:) attachment, so Gmail
 * shows it even when the site isn't publicly reachable (e.g. localhost).
 * src/ and dist/ mirror each other, so this path works in dev and production.
 */
const LOGO_CID = "taj-band-logo";
const logoPng = readFileSync(new URL("../../../assets/email-logo.png", import.meta.url));

/** Brand for sent mail: logo from the inline attachment. */
export const withInlineLogo = (brand: EmailBrand): EmailBrand => ({
  ...brand,
  logoSrc: `cid:${LOGO_CID}`,
});

/**
 * Sends email over SMTP (e.g. Gmail + App Password) when SMTP_USER/SMTP_PASS are
 * set, otherwise via Resend's HTTP API when RESEND_API_KEY/MAIL_FROM are set.
 */
export class Mailer {
  private smtp?: Transporter;

  private constructor(
    readonly kind: "smtp" | "resend",
    private readonly config: ConfigService<Env, true>,
  ) {}

  /** null when no transport is configured. */
  static fromConfig(config: ConfigService<Env, true>): Mailer | null {
    if (config.get("SMTP_USER", { infer: true }) && config.get("SMTP_PASS", { infer: true })) {
      return new Mailer("smtp", config);
    }
    if (config.get("RESEND_API_KEY", { infer: true }) && config.get("MAIL_FROM", { infer: true })) {
      return new Mailer("resend", config);
    }
    return null;
  }

  static readonly setupHint =
    "set SMTP_USER + SMTP_PASS (Gmail App Password) or RESEND_API_KEY + MAIL_FROM in apps/api/.env";

  /** MAIL_FROM, else (SMTP only) the business name on the SMTP account's address. */
  from(displayName: string): string {
    const configured = this.config.get("MAIL_FROM", { infer: true });
    if (configured) return configured;
    const user = this.config.get("SMTP_USER", { infer: true })!;
    return `"${displayName.replace(/"/g, "")}" <${user}>`;
  }

  async send(from: string, m: Message): Promise<void> {
    const inlineLogo = m.html.includes(`cid:${LOGO_CID}`);
    if (this.kind === "smtp") {
      this.smtp ??= this.createSmtp();
      await this.smtp.sendMail({
        from,
        to: m.to,
        replyTo: m.replyTo ?? undefined,
        subject: m.subject,
        html: m.html,
        text: m.text,
        attachments: inlineLogo
          ? [{ filename: "logo.png", content: logoPng, cid: LOGO_CID, contentType: "image/png" }]
          : undefined,
      });
      return;
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.config.get("RESEND_API_KEY", { infer: true })}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: m.to,
        subject: m.subject,
        html: m.html,
        text: m.text,
        ...(m.replyTo ? { reply_to: m.replyTo } : {}),
        ...(inlineLogo
          ? {
              attachments: [
                {
                  filename: "logo.png",
                  content: logoPng.toString("base64"),
                  content_id: LOGO_CID,
                },
              ],
            }
          : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
  }

  private createSmtp(): Transporter {
    const port = this.config.get("SMTP_PORT", { infer: true });
    return createTransport({
      host: this.config.get("SMTP_HOST", { infer: true }),
      port,
      secure: port === 465,
      auth: {
        user: this.config.get("SMTP_USER", { infer: true })!,
        // Google shows App Passwords in groups of four ("abcd efgh …"); spaces aren't part of it.
        pass: this.config.get("SMTP_PASS", { infer: true })!.replace(/\s+/g, ""),
      },
      connectionTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
}
