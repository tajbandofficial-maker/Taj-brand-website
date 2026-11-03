import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { Env } from "../../config/env.schema.js";
import { InquiryStatus, type Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { NotificationsService } from "../notifications/notifications.service.js";
import type { ListInquiriesQuery, PublicInquiryDto, UpdateInquiryDto } from "./inquiries.dto.js";

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger(InquiriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  /** Bots get a normal 200 but are stored as SPAM without notifying anyone. */
  async submit(dto: PublicInquiryDto, ip: string | null): Promise<{ ok: true }> {
    const base = {
      name: dto.name.trim(),
      phone: dto.phone,
      email: dto.email?.trim().toLowerCase() || null,
      weddingDate: dto.weddingDate ? new Date(dto.weddingDate) : null,
      venue: dto.venue?.trim() || null,
      services: dto.services,
      message: dto.message?.trim() || null,
      sourcePage: dto.sourcePage ?? null,
      ip,
    };

    if (dto.company) {
      await this.prisma.inquiry.create({ data: { ...base, status: InquiryStatus.SPAM } });
      this.logger.warn({ ip }, "Honeypot filled — stored as spam");
      return { ok: true };
    }

    await this.verifyTurnstile(dto.turnstileToken ?? null, ip);
    const inquiry = await this.prisma.inquiry.create({ data: base });
    void this.notifications.inquiryReceived(inquiry);
    return { ok: true };
  }

  private async verifyTurnstile(token: string | null, ip: string | null): Promise<void> {
    const secret = this.config.get("TURNSTILE_SECRET_KEY", { infer: true });
    if (!secret) return; // not configured (development)
    if (!token) throw new BadRequestException("Please complete the spam check and try again.");
    const body = new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) });
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success: boolean };
    if (!data.success) throw new BadRequestException("Spam check failed. Please try again.");
  }

  async list({ status, q, page, pageSize }: ListInquiriesQuery) {
    const where: Prisma.InquiryWhereInput = {
      ...(status ? { status } : { status: { not: InquiryStatus.SPAM } }),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q.replace(/\D/g, "") || q } },
              { venue: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.inquiry.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async get(id: string) {
    const i = await this.prisma.inquiry.findUnique({ where: { id } });
    if (!i) throw new NotFoundException("Inquiry not found");
    return i;
  }

  update(id: string, dto: UpdateInquiryDto) {
    return this.prisma.inquiry.update({ where: { id }, data: dto });
  }

  async stats() {
    const day = 24 * 60 * 60 * 1000;
    const since = (days: number) => new Date(Date.now() - days * day);
    const [byStatus, last7, last30, recent] = await Promise.all([
      this.prisma.inquiry.groupBy({ by: ["status"], _count: { _all: true } }),
      this.prisma.inquiry.count({
        where: { createdAt: { gte: since(7) }, status: { not: InquiryStatus.SPAM } },
      }),
      this.prisma.inquiry.count({
        where: { createdAt: { gte: since(30) }, status: { not: InquiryStatus.SPAM } },
      }),
      this.prisma.inquiry.findMany({
        where: { status: { not: InquiryStatus.SPAM } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);
    const counts = Object.fromEntries(Object.values(InquiryStatus).map((s) => [s, 0])) as Record<
      InquiryStatus,
      number
    >;
    for (const row of byStatus) counts[row.status] = row._count._all;
    return { byStatus: counts, last7Days: last7, last30Days: last30, recent };
  }
}
