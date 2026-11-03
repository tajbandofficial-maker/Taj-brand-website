import type { Inquiry } from "../../generated/prisma/client.js";
import {
  button,
  colors,
  detailsTable,
  type EmailBrand,
  emailLayout,
  esc,
  heading,
  highlight,
  paragraph,
  steps,
} from "./email-layout.js";

export type Email = { subject: string; html: string; text: string };

type Input = {
  inquiry: Inquiry;
  /** Service titles for the inquiry's slugs, in the same order. */
  services: string[];
  brand: EmailBrand;
};

/** "919876543210" → "+91 98765 43210" */
export function formatIndianPhone(e164: string): string {
  const d = e164.replace(/\D/g, "");
  return d.length === 12 ? `+${d.slice(0, 2)} ${d.slice(2, 7)} ${d.slice(7)}` : `+${d}`;
}

/** Wedding dates are stored at UTC midnight, so format them in UTC. */
function formatWeddingDate(d: Date | null): string | null {
  return d
    ? new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(d)
    : null;
}

const formatReceived = (d: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(d);

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;
const waLink = (digits: string, text: string) =>
  `https://wa.me/${digits.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

/** Text version from label/value rows. */
const textRows = (rows: [string, string | null][]) =>
  rows.map(([k, v]) => `${k}: ${v ?? "—"}`).join("\n");

/** Confirmation to the person who sent the enquiry. */
export function clientInquiryEmail({ inquiry: i, services, brand }: Input): Email {
  const name = firstName(i.name);
  const date = formatWeddingDate(i.weddingDate);
  const rows: [string, string | null][] = [
    ["Name", i.name],
    ["Phone", formatIndianPhone(i.phone)],
    ["Wedding date", date],
    ["Venue / area", i.venue],
    ["Services", services.join(", ") || null],
    ["Message", i.message],
  ];
  const whatsapp = waLink(
    brand.whatsapp,
    `Hi ${brand.name}, I just sent an enquiry on your website${date ? ` for ${date}` : ""}. My name is ${i.name}.`,
  );
  const tel = `tel:${brand.phone.replace(/[^\d+]/g, "")}`;
  const since = brand.foundedYear ? `Baraats since ${brand.foundedYear}` : brand.tagline;
  const subject = `We've received your enquiry — ${brand.name}`;

  const body = [
    paragraph(
      `We've received your enquiry and our team will get back to you shortly on <strong>${esc(formatIndianPhone(i.phone))}</strong> to confirm availability and share the right package for your celebration.`,
    ),
    date ? highlight("Your date", date) : "",
    heading("Your enquiry"),
    detailsTable(rows),
    heading("What happens next"),
    steps([
      [
        "We check your date",
        "Peak muhurat dates book out early, so we confirm availability first.",
      ],
      ["We share options & a quote", "The right package for your baraat, with a clear price."],
      ["You lock your date", "Confirm the booking and we take care of the rest."],
    ]),
    paragraph("Can't wait? Talk to us right now:"),
    `<div style="margin:0 0 6px;">${button("Chat on WhatsApp", whatsapp, "whatsapp")}${button(`Call ${brand.phone}`, tel, "dark")}</div>`,
    paragraph(
      `<a href="${esc(`${brand.siteUrl}/packages`)}" target="_blank" style="color:${colors.gold700};font-weight:700;text-decoration:none;">Explore our packages &rarr;</a>`,
    ),
    `<p style="margin:26px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:24px;color:${colors.ink};">Warm regards,<br><span style="font-size:20px;color:${colors.cocoa900};">Team ${esc(brand.name)}</span><br><span style="font-size:13px;color:${colors.inkMuted};">${esc(since)}</span></p>`,
  ].join("\n");

  return {
    subject,
    html: emailLayout({
      brand,
      title: subject,
      preheader: `Thank you, ${name}! We'll confirm availability${date ? ` for ${date}` : ""} shortly.`,
      eyebrow: "Enquiry received",
      headline: `Thank you, ${name}!`,
      body,
      footnote: `You're receiving this because you sent an enquiry on the ${esc(brand.name)} website. If that wasn't you, please ignore this email.`,
    }),
    text: [
      `Thank you, ${name}!`,
      "",
      `We've received your enquiry and our team will get back to you shortly on ${formatIndianPhone(i.phone)} to confirm availability and share the right package.`,
      "",
      "YOUR ENQUIRY",
      textRows(rows),
      "",
      "WHAT HAPPENS NEXT",
      "1. We check your date.",
      "2. We share options & a quote.",
      "3. You lock your date.",
      "",
      `WhatsApp: ${whatsapp}`,
      `Call: ${brand.phone}`,
      `Packages: ${brand.siteUrl}/packages`,
      "",
      `Warm regards,\nTeam ${brand.name}`,
      `${brand.address}`,
    ].join("\n"),
  };
}

/** Alert to the business with everything needed to reply in one tap. */
export function teamInquiryEmail({ inquiry: i, services, brand }: Input): Email {
  const name = firstName(i.name);
  const date = formatWeddingDate(i.weddingDate);
  const phone = formatIndianPhone(i.phone);
  const rows: [string, string | null][] = [
    ["Name", i.name],
    ["Phone", phone],
    ["Email", i.email],
    ["Wedding date", date],
    ["Venue / area", i.venue],
    ["Services", services.join(", ") || null],
    ["Message", i.message],
    ["Sent from", i.sourcePage ? `${brand.siteUrl}${i.sourcePage}` : null],
    ["Received", formatReceived(i.createdAt)],
  ];
  const whatsapp = waLink(
    i.phone,
    `Hi ${name}, this is ${brand.name} replying to your wedding enquiry.`,
  );
  const admin = `${brand.siteUrl}/admin/inquiries/${i.id}`;
  const subject = `New enquiry: ${i.name}${date ? ` · ${date}` : ""}`;

  const actions = [
    button(`WhatsApp ${name}`, whatsapp, "whatsapp"),
    button(`Call ${phone}`, `tel:+${i.phone}`, "dark"),
    i.email
      ? button(
          "Reply by email",
          `mailto:${i.email}?subject=${encodeURIComponent(`Your enquiry with ${brand.name}`)}`,
          "outline",
        )
      : "",
  ].join("");

  const body = [
    paragraph(
      `A new enquiry just came in from the website${i.sourcePage ? ` (<strong>${esc(i.sourcePage)}</strong>)` : ""}. Peak dates go fast — reply soon.`,
    ),
    date ? highlight("Wedding date", date) : "",
    `<div style="margin:18px 0 4px;">${actions}</div>`,
    heading("Enquiry details"),
    detailsTable(rows),
    `<div style="margin:24px 0 0;">${button("Open in admin", admin, "gold")}</div>`,
    paragraph(
      `<span style="font-size:13px;color:${colors.inkMuted};">Update its status and add notes in the admin so the team knows it's handled.</span>`,
    ),
  ].join("\n");

  return {
    subject,
    html: emailLayout({
      brand,
      title: subject,
      preheader: [services.join(", "), i.venue, phone].filter(Boolean).join(" · "),
      eyebrow: "New website enquiry",
      headline: date ? `${i.name} wants to book a date` : `New enquiry from ${i.name}`,
      body,
      footnote: i.email
        ? `Sent automatically by the website. Reply to this email to answer ${esc(i.name)} directly.`
        : "Sent automatically by the website contact form.",
    }),
    text: [
      `New enquiry from ${i.name}`,
      "",
      textRows(rows),
      "",
      `WhatsApp: ${whatsapp}`,
      `Call: ${phone}`,
      `Admin: ${admin}`,
    ].join("\n"),
  };
}
