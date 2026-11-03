import { Injectable, NotFoundException } from "@nestjs/common";

import { linkOne } from "../../common/prisma-relations.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CacheInvalidationService } from "../cache-invalidation/cache-invalidation.service.js";
import type { CreateFaqDto, UpdateFaqDto } from "./faqs.dto.js";

const include = { service: { select: { id: true, slug: true, title: true } } } as const;

@Injectable()
export class FaqsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheInvalidationService,
  ) {}

  private touched(...slugs: (string | undefined)[]) {
    const serviceSlugs = [...new Set(slugs.filter((s): s is string => Boolean(s)))];
    this.cache.invalidate({ entity: "faq", serviceSlugs });
  }

  list(serviceId?: string) {
    return this.prisma.faq.findMany({
      where: serviceId ? { serviceId } : undefined,
      orderBy: [{ serviceId: "asc" }, { order: "asc" }],
      include,
    });
  }

  async get(id: string) {
    const f = await this.prisma.faq.findUnique({ where: { id }, include });
    if (!f) throw new NotFoundException("FAQ not found");
    return f;
  }

  async create({ serviceId, ...data }: CreateFaqDto) {
    const last = await this.prisma.faq.aggregate({
      where: { serviceId: serviceId ?? null },
      _max: { order: true },
    });
    const f = await this.prisma.faq.create({
      data: { ...data, order: (last._max.order ?? -1) + 1, service: linkOne(serviceId, "create") },
      include,
    });
    this.touched(f.service?.slug);
    return f;
  }

  async update(id: string, { serviceId, ...data }: UpdateFaqDto) {
    const before = await this.get(id);
    const f = await this.prisma.faq.update({
      where: { id },
      data: { ...data, service: linkOne(serviceId, "update") },
      include,
    });
    this.touched(before.service?.slug, f.service?.slug);
    return f;
  }

  async remove(id: string) {
    const before = await this.get(id);
    await this.prisma.faq.delete({ where: { id } });
    this.touched(before.service?.slug);
    return { id };
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, order) => this.prisma.faq.update({ where: { id }, data: { order } })),
    );
    this.touched();
    return { ok: true };
  }
}
