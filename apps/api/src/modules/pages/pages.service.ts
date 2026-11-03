import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { isPageKey, pageDefs, type PageFieldDef, type PageKey, pageKeys } from "@taj/types";

import { linkOne } from "../../common/prisma-relations.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CacheInvalidationService } from "../cache-invalidation/cache-invalidation.service.js";
import type { UpdatePageDto } from "./pages.dto.js";

const include = { heroImage: true, ogImage: true } as const;
type PageRow = Prisma.PageContentModel & {
  heroImage: Prisma.MediaModel | null;
  ogImage: Prisma.MediaModel | null;
};

/** Rejects unknown keys, non-strings and over-long text; drops blanks (= use the default). */
function cleanFields(key: PageKey, fields: Record<string, unknown>): Record<string, string> {
  const defs: Record<string, PageFieldDef> = pageDefs[key].fields;
  const errors: string[] = [];
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    const def = defs[k];
    if (!def) errors.push(`fields.${k} is not a field of the ${pageDefs[key].label} page`);
    else if (typeof v !== "string") errors.push(`${def.label} must be text`);
    else if (v.length > def.max) errors.push(`${def.label} must be at most ${def.max} characters`);
    else if (v.trim()) out[k] = v.trim();
  }
  if (errors.length > 0) throw new BadRequestException(errors);
  return out;
}

/** Fixed pages' copy, images, video and SEO. A page has no row until first saved. */
@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheInvalidationService,
  ) {}

  private key(key: string): PageKey {
    if (!isPageKey(key)) throw new NotFoundException("Page not found");
    return key;
  }

  /** Every page with its row (or an empty one), in menu order. */
  async list() {
    const rows = await this.prisma.pageContent.findMany({ include });
    return pageKeys.map((key) => this.withDefaults(key, rows.find((r) => r.key === key) ?? null));
  }

  async get(rawKey: string) {
    const key = this.key(rawKey);
    const row = await this.prisma.pageContent.findUnique({ where: { key }, include });
    return this.withDefaults(key, row);
  }

  async update(rawKey: string, dto: UpdatePageDto) {
    const key = this.key(rawKey);
    const { fields, heroImageId, ogImageId, ...data } = dto;
    const clean = fields ? cleanFields(key, fields) : undefined;
    const row = await this.prisma.pageContent.upsert({
      where: { key },
      create: {
        key,
        ...data,
        fields: clean ?? {},
        heroImage: linkOne(heroImageId, "create"),
        ogImage: linkOne(ogImageId, "create"),
      },
      update: {
        ...data,
        fields: clean,
        heroImage: linkOne(heroImageId, "update"),
        ogImage: linkOne(ogImageId, "update"),
      },
      include,
    });
    this.cache.invalidate({ entity: "page", key });
    return this.withDefaults(key, row);
  }

  /** Admin shape: `id` = key so the generic admin form hooks work unchanged. */
  private withDefaults(key: PageKey, row: PageRow | null) {
    return {
      id: key,
      key,
      label: pageDefs[key].label,
      path: pageDefs[key].path,
      fields: (row?.fields ?? {}) as Record<string, string>,
      heroImageId: row?.heroImageId ?? null,
      heroImage: row?.heroImage ?? null,
      youtubeId: row?.youtubeId ?? null,
      seoTitle: row?.seoTitle ?? null,
      seoDescription: row?.seoDescription ?? null,
      ogImageId: row?.ogImageId ?? null,
      ogImage: row?.ogImage ?? null,
      updatedAt: row?.updatedAt.toISOString() ?? null,
    };
  }
}
