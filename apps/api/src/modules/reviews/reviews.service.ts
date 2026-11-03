import { Injectable, NotFoundException } from "@nestjs/common";

import { linkOne } from "../../common/prisma-relations.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CacheInvalidationService } from "../cache-invalidation/cache-invalidation.service.js";
import type { CreateReviewDto, UpdateReviewDto } from "./reviews.dto.js";

const include = { image: true } as const;
const toDate = (d: string | null | undefined) =>
  d === undefined ? undefined : d === null ? null : new Date(d);

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheInvalidationService,
  ) {}

  list() {
    return this.prisma.review.findMany({ orderBy: { order: "asc" }, include });
  }

  async get(id: string) {
    const r = await this.prisma.review.findUnique({ where: { id }, include });
    if (!r) throw new NotFoundException("Review not found");
    return r;
  }

  async create({ imageId, eventDate, ...data }: CreateReviewDto) {
    const last = await this.prisma.review.aggregate({ _max: { order: true } });
    const r = await this.prisma.review.create({
      data: {
        ...data,
        eventDate: toDate(eventDate),
        order: (last._max.order ?? -1) + 1,
        image: linkOne(imageId, "create"),
      },
      include,
    });
    this.cache.invalidate({ entity: "review" });
    return r;
  }

  async update(id: string, { imageId, eventDate, ...data }: UpdateReviewDto) {
    const r = await this.prisma.review.update({
      where: { id },
      data: { ...data, eventDate: toDate(eventDate), image: linkOne(imageId, "update") },
      include,
    });
    this.cache.invalidate({ entity: "review" });
    return r;
  }

  async remove(id: string) {
    await this.prisma.review.delete({ where: { id } });
    this.cache.invalidate({ entity: "review" });
    return { id };
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, order) => this.prisma.review.update({ where: { id }, data: { order } })),
    );
    this.cache.invalidate({ entity: "review" });
    return { ok: true };
  }
}
