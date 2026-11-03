import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { Env } from "../../config/env.schema.js";
import type { Inquiry } from "../../generated/prisma/client.js";
import { PrismaService } from "../../prisma/prisma.service.js";
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

  /** Business details and service titles for the templates. */
  async context(inquiry: Pick<Inquiry, "services">) {
    const [s, rows] = await Promise.all([
      this.prisma.siteSettings.findUniqueOrThrow({ where: { id: 1 } }),
      this.prisma.service.findMany({
        where: { slug: { in: inquiry.services } },
        select: { slug: true, title: true },
      }),
    ]);
    const brand: EmailBrand = {
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
    const services = inquiry.services.map(
      (slug) => rows.find((r) => r.slug === slug)?.title ?? slug,
    );
    return { brand, services };
  }
}
