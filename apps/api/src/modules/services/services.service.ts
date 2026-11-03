import { Injectable, NotFoundException } from "@nestjs/common";

import { linkMany, linkOne } from "../../common/prisma-relations.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CacheInvalidationService } from "../cache-invalidation/cache-invalidation.service.js";
import type { CreateServiceDto, ServiceSectionDto, UpdateServiceDto } from "./services.dto.js";

/** DTO class instances → plain JSON for the `sections` column. */
const plainSections = (sections: ServiceSectionDto[]) =>
  sections.map(({ heading, body }) => ({ heading, body }));

const include = {
  heroImage: true,
  ogImage: true,
  relatedPackages: { select: { id: true, name: true } },
  _count: { select: { faqs: true, galleryItems: true } },
} as const;

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheInvalidationService,
  ) {}

  list() {
    return this.prisma.service.findMany({ orderBy: { order: "asc" }, include });
  }

  async get(id: string) {
    const s = await this.prisma.service.findUnique({ where: { id }, include });
    if (!s) throw new NotFoundException("Service not found");
    return s;
  }

  async create(dto: CreateServiceDto) {
    const { relatedPackageIds, heroImageId, ogImageId, sections, ...data } = dto;
    const last = await this.prisma.service.aggregate({ _max: { order: true } });
    const created = await this.prisma.service.create({
      data: {
        ...data,
        sections: plainSections(sections),
        order: (last._max.order ?? -1) + 1,
        heroImage: linkOne(heroImageId, "create"),
        ogImage: linkOne(ogImageId, "create"),
        relatedPackages: linkMany(relatedPackageIds, "create"),
      },
      include,
    });
    this.cache.invalidate({ entity: "service", slugs: [created.slug] });
    return created;
  }

  async update(id: string, dto: UpdateServiceDto) {
    const before = await this.get(id);
    const { relatedPackageIds, heroImageId, ogImageId, sections, ...data } = dto;
    const updated = await this.prisma.service.update({
      where: { id },
      data: {
        ...data,
        sections: sections ? plainSections(sections) : undefined,
        heroImage: linkOne(heroImageId, "update"),
        ogImage: linkOne(ogImageId, "update"),
        relatedPackages: linkMany(relatedPackageIds, "update"),
      },
      include,
    });
    // Old + new slug so a rename refreshes both URLs.
    this.cache.invalidate({ entity: "service", slugs: [before.slug, updated.slug] });
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.prisma.service.delete({ where: { id } });
    this.cache.invalidate({ entity: "service", slugs: [deleted.slug] });
    return { id };
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, order) => this.prisma.service.update({ where: { id }, data: { order } })),
    );
    this.cache.invalidate({ entity: "service", slugs: [] });
    return { ok: true };
  }
}
