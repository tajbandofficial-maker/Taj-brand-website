import type { ConfigService } from "@nestjs/config";

const { sendMail, createTransport } = vi.hoisted(() => {
  const sendMail = vi.fn();
  return { sendMail, createTransport: vi.fn(() => ({ sendMail })) };
});
vi.mock("nodemailer", () => ({ createTransport }));

import type { Env } from "../../config/env.schema.js";
import { type Inquiry, InquiryStatus } from "../../generated/prisma/client.js";
import type { PrismaService } from "../../prisma/prisma.service.js";
import type { EmailBrand } from "./email-layout.js";
import { clientInquiryEmail, formatIndianPhone, teamInquiryEmail } from "./inquiry-emails.js";
import { NotificationsService } from "./notifications.service.js";

const inquiry: Inquiry = {
  id: "inq1",
  name: "Riya <b>Malhotra</b>",
  phone: "919876543210",
  email: "riya@example.com",
  weddingDate: new Date("2026-12-12"),
  venue: "Gurugram",
  services: ["dhol-players"],
  message: "Line one\nLine two",
  sourcePage: "/contact",
  ip: null,
  status: InquiryStatus.NEW,
  notes: null,
  createdAt: new Date("2026-11-01T10:00:00Z"),
  updatedAt: new Date("2026-11-01T10:00:00Z"),
};

const brand: EmailBrand = {
  name: "Taj Band",
  tagline: "Old Is Gold",
  phone: "+91 95608 02046",
  whatsapp: "919560802046",
  email: "tajbandofficial@gmail.com",
  address: "Tagore Garden, New Delhi 110027",
  siteUrl: "https://tajband.example",
  foundedYear: 1946,
  socials: {},
};

const input = { inquiry, services: ["Dhol Players"], brand };

describe("inquiry email templates", () => {
  it("formats Indian mobiles", () => {
    expect(formatIndianPhone("919876543210")).toBe("+91 98765 43210");
  });

  it("client email: themed, escaped, absolute logo, the visitor's details", () => {
    const mail = clientInquiryEmail(input);
    expect(mail.subject).toBe("We've received your enquiry — Taj Band");
    expect(mail.html).toContain('src="https://tajband.example/email/logo.png"');
    expect(mail.html).toContain("Saturday, 12 December 2026");
    expect(mail.html).toContain("Dhol Players");
    expect(mail.html).toContain("Line one<br>Line two");
    expect(mail.html).not.toContain("<b>Malhotra</b>");
    expect(mail.html).toContain("https://wa.me/919560802046?text=");
    expect(mail.html).toContain("Baraats since 1946");
    expect(mail.text).toContain("Team Taj Band");
  });

  it("team email: reply buttons, admin link, email row only when given", () => {
    const withEmail = teamInquiryEmail(input);
    expect(withEmail.subject).toContain("New enquiry:");
    expect(withEmail.html).toContain("https://wa.me/919876543210?text=");
    expect(withEmail.html).toContain("https://tajband.example/admin/inquiries/inq1");
    expect(withEmail.html).toContain("mailto:riya@example.com");

    const noEmail = teamInquiryEmail({ ...input, inquiry: { ...inquiry, email: null } });
    expect(noEmail.html).not.toContain("mailto:riya");
  });
});

describe("NotificationsService.inquiryReceived", () => {
  const env: Partial<Record<keyof Env, string>> = {
    RESEND_API_KEY: "re_test",
    MAIL_FROM: "Taj Band <hello@tajband.example>",
    INQUIRY_NOTIFY_EMAILS: "team@tajband.example",
    PUBLIC_SITE_URL: "https://tajband.example/",
  };
  const prisma = {
    siteSettings: {
      findUniqueOrThrow: vi.fn().mockResolvedValue({
        businessName: "Taj Band",
        tagline: "Old Is Gold",
        phone: "+91 95608 02046",
        whatsapp: "919560802046",
        email: "tajbandofficial@gmail.com",
        addressLine: "Tagore Garden",
        city: "New Delhi",
        postalCode: "110027",
        foundedYear: 1946,
        socials: {},
      }),
    },
    service: {
      findMany: vi.fn().mockResolvedValue([{ slug: "dhol-players", title: "Dhol Players" }]),
    },
  } as unknown as PrismaService;
  const service = (values = env) =>
    new NotificationsService(
      { get: (k: keyof Env) => values[k] } as unknown as ConfigService<Env, true>,
      prisma,
    );

  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  const sent = () =>
    fetchMock.mock.calls.map(([, init]) => JSON.parse((init as RequestInit).body as string));

  it("emails the team (reply → client) and the client (reply → business inbox)", async () => {
    await service().inquiryReceived(inquiry);
    const [team, client] = sent();
    expect(team).toMatchObject({ to: ["team@tajband.example"], reply_to: "riya@example.com" });
    expect(client).toMatchObject({
      to: ["riya@example.com"],
      reply_to: "tajbandofficial@gmail.com",
    });
    // Sent mail carries the logo inline, so Gmail shows it even before the site is public.
    expect(client.html).toContain('src="cid:taj-band-logo"');
    expect(client.attachments).toEqual([
      expect.objectContaining({ filename: "logo.png", content_id: "taj-band-logo" }),
    ]);
  });

  it("only emails the team when the visitor left no email", async () => {
    await service().inquiryReceived({ ...inquiry, email: null });
    expect(sent()).toHaveLength(1);
    expect(sent()[0].reply_to).toBeUndefined();
  });

  it("uses BUSINESS_EMAIL for the footer, client replies and (by default) alerts", async () => {
    await service({
      ...env,
      INQUIRY_NOTIFY_EMAILS: undefined,
      BUSINESS_EMAIL: "bookings@tajband.example",
    }).inquiryReceived(inquiry);
    const [team, client] = sent();
    expect(team.to).toEqual(["bookings@tajband.example"]);
    expect(client.reply_to).toBe("bookings@tajband.example");
    expect(client.html).toContain("mailto:bookings@tajband.example");
  });

  it("sends through Gmail SMTP when SMTP_USER/SMTP_PASS are set", async () => {
    sendMail.mockReset().mockResolvedValue({});
    await service({
      PUBLIC_SITE_URL: "https://tajband.example",
      BUSINESS_EMAIL: "webx@gmail.com",
      SMTP_HOST: "smtp.gmail.com",
      SMTP_PORT: 465,
      SMTP_USER: "webx@gmail.com",
      SMTP_PASS: "abcd efgh ijkl mnop",
    } as never).inquiryReceived(inquiry);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: "webx@gmail.com", pass: "abcdefghijklmnop" },
      }),
    );
    const [team, client] = sendMail.mock.calls.map(([m]) => m);
    expect(team).toMatchObject({ from: '"Taj Band" <webx@gmail.com>', to: ["webx@gmail.com"] });
    expect(team.replyTo).toBe("riya@example.com");
    expect(client).toMatchObject({ to: ["riya@example.com"], replyTo: "webx@gmail.com" });
    expect(client.attachments).toEqual([
      expect.objectContaining({ cid: "taj-band-logo", contentType: "image/png" }),
    ]);
  });

  it("skips everything when email isn't configured", async () => {
    await service({ ...env, RESEND_API_KEY: undefined }).inquiryReceived(inquiry);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never throws when the email provider fails", async () => {
    fetchMock.mockResolvedValue(new Response("nope", { status: 500 }));
    await expect(service().inquiryReceived(inquiry)).resolves.toBeUndefined();
  });
});
