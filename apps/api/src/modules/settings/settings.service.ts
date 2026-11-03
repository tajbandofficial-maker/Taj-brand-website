import { Injectable, NotFoundException } from "@nestjs/common";

import { linkOne } from "../../common/prisma-relations.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CacheInvalidationService } from "../cache-invalidation/cache-invalidation.service.js";
import type { UpdateSettingsDto } from "./settings.dto.js";

const include = { ogImage: true } as const;

/** SiteSettings is a singleton row (id = 1), created by the seed script. */
@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheInvalidationService,
  ) {}

  async get() {
    const s = await this.prisma.siteSettings.findUnique({ where: { id: 1 }, include });
    if (!s) throw new NotFoundException("Site settings missing — run the seed script.");
    return s;
  }

  async update({ hours, socials, ogImageId, ...data }: UpdateSettingsDto) {
    const s = await this.prisma.siteSettings.update({
      where: { id: 1 },
      data: {
        ...data,
        hours: hours?.map(({ days, opens, closes }) => ({ days, opens, closes })),
        socials: socials ? { ...socials } : undefined,
        ogImage: linkOne(ogImageId, "update"),
      },
      include,
    });
    this.cache.invalidate({ entity: "settings" });
    return s;
  }
}
