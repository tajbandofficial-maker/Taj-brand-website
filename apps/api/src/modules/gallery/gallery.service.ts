import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { linkOne } from "../../common/prisma-relations.js";
import { GalleryCategory, GalleryType } from "../../generated/prisma/client.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CacheInvalidationService } from "../cache-invalidation/cache-invalidation.service.js";
import type { CreateGalleryItemDto, UpdateGalleryItemDto } from "./gallery.dto.js";

const include = {
  media: true,
  service: { select: { id: true, slug: true, title: true } },
} as const;

type Shape = { type: GalleryType; mediaId: string | null; youtubeId: string | null };

/** IMAGE needs a photo; VIDEO needs a YouTube id (photo optional = poster). */
export function assertGalleryShape(s: Shape): void {
  if (s.type === GalleryType.IMAGE && !s.mediaId) {
    throw new BadRequestException("A photo is required for an image item.");
  }
  if (s.type === GalleryType.VIDEO && !s.youtubeId) {
    throw new BadRequestException("A YouTube link is required for a video item.");
  }
}

@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheInvalidationService,
  ) {}

  list(category?: GalleryCategory) {
    return this.prisma.galleryItem.findMany({
      where: category ? { category } : undefined,
      orderBy: { order: "asc" },
      include,
    });
  }

  async get(id: string) {
    const g = await this.prisma.galleryItem.findUnique({ where: { id }, include });
    if (!g) throw new NotFoundException("Gallery item not found");
    return g;
  }

  async create({ mediaId, serviceId, ...data }: CreateGalleryItemDto) {
    assertGalleryShape({
      type: data.type,
      mediaId: mediaId ?? null,
      youtubeId: data.youtubeId ?? null,
    });
    const last = await this.prisma.galleryItem.aggregate({ _max: { order: true } });
    const g = await this.prisma.galleryItem.create({
      data: {
        ...data,
        order: (last._max.order ?? -1) + 1,
        media: linkOne(mediaId, "create"),
        service: linkOne(serviceId, "create"),
      },
      include,
    });
    this.cache.invalidate({ entity: "gallery", serviceSlugs: g.service ? [g.service.slug] : [] });
    return g;
  }

  async update(id: string, { mediaId, serviceId, ...data }: UpdateGalleryItemDto) {
    const before = await this.get(id);
    assertGalleryShape({
      type: data.type ?? before.type,
      mediaId: mediaId === undefined ? before.mediaId : mediaId,
      youtubeId: data.youtubeId === undefined ? before.youtubeId : data.youtubeId,
    });
    const g = await this.prisma.galleryItem.update({
      where: { id },
      data: { ...data, media: linkOne(mediaId, "update"), service: linkOne(serviceId, "update") },
      include,
    });
    const slugs = [before.service?.slug, g.service?.slug].filter((s): s is string => Boolean(s));
    this.cache.invalidate({ entity: "gallery", serviceSlugs: [...new Set(slugs)] });
    return g;
  }

  async remove(id: string) {
    const before = await this.get(id);
    await this.prisma.galleryItem.delete({ where: { id } });
    this.cache.invalidate({
      entity: "gallery",
      serviceSlugs: before.service ? [before.service.slug] : [],
    });
    return { id };
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, order) => this.prisma.galleryItem.update({ where: { id }, data: { order } })),
    );
    this.cache.invalidate({ entity: "gallery" });
    return { ok: true };
  }
}
