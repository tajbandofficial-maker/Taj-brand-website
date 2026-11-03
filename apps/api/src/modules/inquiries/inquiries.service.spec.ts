import type { ConfigService } from "@nestjs/config";

import type { Env } from "../../config/env.schema.js";
import type { PrismaService } from "../../prisma/prisma.service.js";
import type { NotificationsService } from "../notifications/notifications.service.js";
import type { PublicInquiryDto } from "./inquiries.dto.js";
import { InquiriesService } from "./inquiries.service.js";

const dto: PublicInquiryDto = {
  name: " Riya ",
  phone: "919876543210",
  weddingDate: "2026-12-11",
  venue: " Gurugram ",
  services: ["dhol-players"],
  message: "",
  sourcePage: "/contact",
};

function setup(turnstileSecret?: string) {
  const create = vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "i1", ...data }));
  const prisma = { inquiry: { create } } as unknown as PrismaService;
  const notifications = { inquiryReceived: vi.fn().mockResolvedValue(undefined) };
  const config = {
    get: (k: keyof Env) => (k === "TURNSTILE_SECRET_KEY" ? turnstileSecret : undefined),
  } as unknown as ConfigService<Env, true>;
  const svc = new InquiriesService(
    prisma,
    notifications as unknown as NotificationsService,
    config,
  );
  return { svc, create, notifications };
}

describe("InquiriesService.submit", () => {
  it("stores a trimmed inquiry and sends a notification", async () => {
    const { svc, create, notifications } = setup();
    await expect(svc.submit(dto, "1.2.3.4")).resolves.toEqual({ ok: true });
    const data = create.mock.calls[0]![0].data;
    expect(data).toMatchObject({ name: "Riya", venue: "Gurugram", message: null, ip: "1.2.3.4" });
    expect(data.weddingDate).toEqual(new Date("2026-12-11"));
    expect(notifications.inquiryReceived).toHaveBeenCalledOnce();
  });

  it("stores honeypot submissions as SPAM, answers 200 and does not notify", async () => {
    const { svc, create, notifications } = setup();
    await expect(svc.submit({ ...dto, company: "Acme" }, null)).resolves.toEqual({ ok: true });
    expect(create.mock.calls[0]![0].data.status).toBe("SPAM");
    expect(notifications.inquiryReceived).not.toHaveBeenCalled();
  });

  it("requires a Turnstile token once Turnstile is configured", async () => {
    const { svc, create } = setup("secret");
    await expect(svc.submit(dto, null)).rejects.toThrow(/spam check/i);
    expect(create).not.toHaveBeenCalled();
  });
});
