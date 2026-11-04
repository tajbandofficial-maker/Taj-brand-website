import { button, colors, type EmailBrand, emailLayout, esc, paragraph } from "./email-layout.js";
import type { Email } from "./inquiry-emails.js";

type ResetInput = {
  brand: EmailBrand;
  /** The admin account whose password is being reset. */
  adminEmail: string;
  /** One-time link to the reset page. */
  link: string;
  /** How long the link works. */
  minutes: number;
  /** When the reset was requested (shown so an unexpected request stands out). */
  requestedAt: Date;
};

const formatTime = (d: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(d);

/** "Reset your admin password" — sent to the business inbox, never to the requester. */
export function passwordResetEmail({
  brand,
  adminEmail,
  link,
  minutes,
  requestedAt,
}: ResetInput): Email {
  const subject = `Reset your ${brand.name} admin password`;
  const when = formatTime(requestedAt);
  const body = [
    paragraph(
      `Someone asked to reset the password for the admin account <strong>${esc(adminEmail)}</strong> on ${esc(new URL(brand.siteUrl).host)}.`,
    ),
    paragraph(
      `Use the button below to choose a new password. The link works once, for ${minutes} minutes.`,
    ),
    `<div style="margin:18px 0 8px;">${button("Choose a new password", link, "gold")}</div>`,
    paragraph(
      `<span style="font-size:13px;color:${colors.inkMuted};">Button not working? Copy this link into your browser:<br><a href="${esc(link)}" style="color:${colors.gold700};word-break:break-all;">${esc(link)}</a></span>`,
    ),
    paragraph(
      `<span style="font-size:13px;color:${colors.inkMuted};">Requested ${esc(when)} (IST). If this wasn't you, ignore this email — the password stays the same.</span>`,
    ),
  ].join("");

  return {
    subject,
    html: emailLayout({
      brand,
      title: subject,
      preheader: `Choose a new password for ${adminEmail}. The link expires in ${minutes} minutes.`,
      eyebrow: "Admin account",
      headline: "Reset your password",
      body,
      footnote:
        "You're receiving this because the admin sign-in page sends password resets to this inbox.",
    }),
    text: [
      `Reset your ${brand.name} admin password`,
      "",
      `Someone asked to reset the password for the admin account ${adminEmail}.`,
      `Choose a new password (the link works once, for ${minutes} minutes):`,
      link,
      "",
      `Requested ${when} (IST). If this wasn't you, ignore this email — the password stays the same.`,
    ].join("\n"),
  };
}
