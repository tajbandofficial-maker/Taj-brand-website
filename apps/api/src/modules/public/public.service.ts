import { Injectable, NotFoundException } from "@nestjs/common";
import { isPageKey } from "@taj/types";

import { GalleryCategory, GalleryType, ReviewSource } from "../../generated/prisma/client.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import * as map from "./public.mapper.js";

const published = { published: true } as const;
const ordered = { order: "asc" } as const;

/** Read-only data for the public site. Only published content is ever returned. */
@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async settings() {
    const s = await this.prisma.siteSettings.findUnique({
      where: { id: 1 },
      include: { ogImage: true },
    });
    if (!s) throw new NotFoundException("Site settings missing — run the seed script.");
    return map.toSettings(s);
  }

  async services() {
    const rows = await this.prisma.service.findMany({
      where: published,
      orderBy: ordered,
      include: { heroImage: true },
    });
    return rows.map(map.toServiceCard);
  }

  async service(slug: string) {
    const s = await this.prisma.service.findFirst({
      where: { slug, ...published },
      include: {
        heroImage: true,
        ogImage: true,
        faqs: { where: published, orderBy: ordered },
        galleryItems: {
          where: { ...published, type: GalleryType.IMAGE, mediaId: { not: null } },
          orderBy: ordered,
          include: { media: true },
          take: 6,
        },
      },
    });
    if (!s) throw new NotFoundException("Service not found");
    return map.toServiceDetail(s);
  }

  /** Unknown keys 404; a page with no saved row still returns (all defaults). */
  async page(key: string) {
    if (!isPageKey(key)) throw new NotFoundException("Page not found");
    const p = await this.prisma.pageContent.findUnique({
      where: { key },
      include: { heroImage: true, ogImage: true },
    });
    return map.toPage(key, p);
  }

  async packages() {
    return (await this.prisma.package.findMany({ where: published, orderBy: ordered })).map(
      map.toPackage,
    );
  }

  comparison() {
    return this.prisma.packageComparisonRow.findMany({
      orderBy: ordered,
      select: { label: true, values: true },
    });
  }

  async addOns() {
    const rows = await this.prisma.addOn.findMany({
      where: published,
      orderBy: ordered,
      include: { service: { select: { slug: true, published: true } } },
    });
    return rows.map(map.toAddOn);
  }

  async gallery(category?: GalleryCategory) {
    const rows = await this.prisma.galleryItem.findMany({
      where: {
        ...published,
        type: GalleryType.IMAGE,
        mediaId: { not: null },
        ...(category ? { category } : {}),
      },
      orderBy: ordered,
      include: { media: true },
    });
    return rows.flatMap((g) => (g.media ? [map.toGalleryImage({ ...g, media: g.media })] : []));
  }

  async videos() {
    const rows = await this.prisma.galleryItem.findMany({
      where: { ...published, type: GalleryType.VIDEO, youtubeId: { not: null } },
      orderBy: ordered,
      include: { media: true },
    });
    return rows.flatMap((g) =>
      g.youtubeId ? [map.toGalleryVideo({ ...g, youtubeId: g.youtubeId })] : [],
    );
  }

  async reviews(opts: { featured?: boolean; source?: ReviewSource }) {
    const rows = await this.prisma.review.findMany({
      where: {
        ...published,
        ...(opts.featured ? { featured: true } : {}),
        // High-profile entries have their own section; exclude unless asked for.
        source: opts.source ?? { not: ReviewSource.HIGH_PROFILE },
      },
      orderBy: ordered,
      include: { image: true },
    });
    return rows.map(map.toReview);
  }

  async globalFaqs() {
    return (
      await this.prisma.faq.findMany({ where: { ...published, serviceId: null }, orderBy: ordered })
    ).map(map.toFaq);
  }

  async sitemap() {
    const [services, settings] = await Promise.all([
      this.prisma.service.findMany({
        where: published,
        select: { slug: true, updatedAt: true },
        orderBy: ordered,
      }),
      this.prisma.siteSettings.findUnique({ where: { id: 1 }, select: { updatedAt: true } }),
    ]);
    return {
      services: services.map((s) => ({ slug: s.slug, updatedAt: s.updatedAt.toISOString() })),
      siteUpdatedAt: (settings?.updatedAt ?? new Date()).toISOString(),
    };
  }
}
