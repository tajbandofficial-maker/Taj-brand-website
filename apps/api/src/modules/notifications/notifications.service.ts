import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { Env } from "../../config/env.schema.js";
import type { Inquiry } from "../../generated/prisma/client.js";
import { toStringList } from "../../prisma/json.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { passwordResetEmail } from "./auth-emails.js";
import type { EmailBrand } from "./email-layout.js";
import { clientInquiryEmail, teamInquiryEmail } from "./inquiry-emails.js";
import { Mailer, type Message, withInlineLogo } from "./mailer.js";

/**
 * Inquiry emails: an alert to the team (INQUIRY_NOTIFY_EMAILS, else BUSINESS_EMAIL)
 * and, when the visitor left an email, a confirmation to them. Sent over SMTP
 * (Gmail) or Resend — see Mailer. Failures are logged, never thrown: the
 * inquiry is already saved.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly mailer: Mailer | null;

  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly prisma: PrismaService,
  ) {
    this.mailer = Mailer.fromConfig(config);
  }

  /** Alert recipients: INQUIRY_NOTIFY_EMAILS, else our own BUSINESS_EMAIL. */
  private teamRecipients(): string[] {
    const listed = this.config
      .get("INQUIRY_NOTIFY_EMAILS", { infer: true })
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const business = this.config.get("BUSINESS_EMAIL", { infer: true });
    return listed?.length ? listed : business ? [business] : [];
  }

  async inquiryReceived(inquiry: Inquiry): Promise<void> {
    const mailer = this.mailer;
    if (!mailer) {
      this.logger.warn({ inquiryId: inquiry.id }, `Inquiry emails NOT sent — ${Mailer.setupHint}`);
      return;
    }

    let input: Parameters<typeof teamInquiryEmail>[0];
    try {
      const { brand, services } = await this.context(inquiry);
      input = { inquiry, services, brand: withInlineLogo(brand) };
    } catch (err) {
      this.logger.error({ err: String(err), inquiryId: inquiry.id }, "Inquiry email failed");
      return;
    }
    const from = mailer.from(input.brand.name);
    const team = this.teamRecipients();
    // Replies go to the other party: team → client, client → the business inbox.
    const messages: [recipient: "team" | "client", Message][] = [];
    if (team.length) {
      messages.push(["team", { ...teamInquiryEmail(input), to: team, replyTo: inquiry.email }]);
    } else {
      this.logger.warn("No BUSINESS_EMAIL or INQUIRY_NOTIFY_EMAILS — team alert skipped");
    }
    if (inquiry.email) {
      messages.push([
        "client",
        {
          ...clientInquiryEmail(input),
          to: [inquiry.email],
          replyTo: input.brand.email ?? team[0],
        },
      ]);
    }

    const results = await Promise.allSettled(messages.map(([, m]) => mailer.send(from, m)));
    results.forEach((r, i) => {
      const [recipient, m] = messages[i]!;
      const log = { inquiryId: inquiry.id, recipient, to: m.to, via: mailer.kind };
      if (r.status === "fulfilled") this.logger.log(log, "Inquiry email sent");
      else this.logger.error({ ...log, err: String(r.reason) }, "Inquiry email failed");
    });
  }

  /**
   * Password-reset link for an admin account. Goes to the official inbox (BUSINESS_EMAIL, else
   * Site settings' email) — never to an address typed on the sign-in page. Returns false when
   * it could not be sent.
   */
  async passwordReset(adminEmail: string, link: string, minutes: number): Promise<boolean> {
    const mailer = this.mailer;
    if (!mailer) {
      this.logger.warn(`Password reset email NOT sent — ${Mailer.setupHint}`);
      return false;
    }
    try {
      const brand = withInlineLogo(await this.brand());
      const to = brand.email;
      if (!to) {
        this.logger.warn("Password reset email NOT sent — set BUSINESS_EMAIL");
        return false;
      }
      const email = passwordResetEmail({
        brand,
        adminEmail,
        link,
        minutes,
        requestedAt: new Date(),
      });
      await mailer.send(mailer.from(brand.name), { ...email, to: [to] });
      this.logger.log({ to, via: mailer.kind }, "Password reset email sent");
      return true;
    } catch (err) {
      this.logger.error({ err: String(err) }, "Password reset email failed");
      return false;
    }
  }

  /** Where password resets go: BUSINESS_EMAIL, else Site settings' email. */
  async officialInbox(): Promise<string | null> {
    const env = this.config.get("BUSINESS_EMAIL", { infer: true });
    if (env) return env;
    const s = await this.prisma.siteSettings.findUnique({
      where: { id: 1 },
      select: { email: true },
    });
    return s?.email ?? null;
  }

  /** Business details shown in every email. */
  async brand(): Promise<EmailBrand> {
    const s = await this.prisma.siteSettings.findUniqueOrThrow({ where: { id: 1 } });
    return {
      name: s.businessName,
      tagline: s.tagline,
      phone: s.phone,
      whatsapp: s.whatsapp,
      // BUSINESS_EMAIL (env) wins; Site settings' email is the fallback.
      email: this.config.get("BUSINESS_EMAIL", { infer: true }) ?? s.email,
      address: [s.addressLine, s.postalCode ? `${s.city} ${s.postalCode}` : s.city].join(", "),
      siteUrl: this.config.get("PUBLIC_SITE_URL", { infer: true }).replace(/\/+$/, ""),
      foundedYear: s.foundedYear,
      socials: (s.socials ?? {}) as EmailBrand["socials"],
    };
  }

  /** Business details and service titles for the templates. */
  async context(inquiry: Pick<Inquiry, "services">) {
    const [brand, rows] = await Promise.all([
      this.brand(),
      this.prisma.service.findMany({
        where: { slug: { in: toStringList(inquiry.services) } },
        select: { slug: true, title: true },
      }),
    ]);
    const services = toStringList(inquiry.services).map(
      (slug) => rows.find((r) => r.slug === slug)?.title ?? slug,
    );
    return { brand, services };
  }
}
