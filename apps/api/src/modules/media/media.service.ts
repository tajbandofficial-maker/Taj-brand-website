import { randomBytes } from "node:crypto";

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service.js";
import { CacheInvalidationService } from "../cache-invalidation/cache-invalidation.service.js";
import type { CreateMediaDto, PresignDto, UpdateMediaDto } from "./media.dto.js";
import { StorageService } from "./storage.service.js";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const usageCount = {
  _count: {
    select: {
      serviceHeroes: true,
      galleryItems: true,
      reviewImages: true,
      pageHeroes: true,
      pageOgImages: true,
      serviceOgImages: true,
      siteOgImages: true,
    },
  },
} as const;

/** "Baraat Night (1).JPG" → "baraat-night-1" */
export function slugifyFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  const slug = base
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "image";
}

/** uploads/<yyyy>/<mm>/<sha8>-<slugified-name>.<ext> (§7.4) — immutable, cacheable forever. */
export function buildMediaKey(
  dto: Pick<PresignDto, "filename" | "mimeType" | "sha256">,
  now = new Date(),
): string {
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const hash = dto.sha256?.slice(0, 8) ?? randomBytes(4).toString("hex");
  return `uploads/${yyyy}/${mm}/${hash}-${slugifyFilename(dto.filename)}.${EXT[dto.mimeType]}`;
}

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly cache: CacheInvalidationService,
  ) {}

  async presign(dto: PresignDto) {
    const key = buildMediaKey(dto);
    const uploadUrl = await this.storage.presignPut(key, dto.mimeType, dto.size);
    return { uploadUrl, key, publicUrl: this.storage.publicUrl(key) };
  }

  async create(dto: CreateMediaDto) {
    if (!(await this.storage.exists(dto.key))) {
      throw new BadRequestException("Upload not found — please try uploading the image again.");
    }
    return this.prisma.media.upsert({
      where: { key: dto.key }, // same content uploaded twice → same record
      create: {
        key: dto.key,
        url: this.storage.publicUrl(dto.key),
        mimeType: dto.mimeType,
        width: dto.width ?? null,
        height: dto.height ?? null,
        alt: dto.alt,
      },
      update: { alt: dto.alt },
    });
  }

  list() {
    return this.prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: usageCount,
    });
  }

  async updateAlt(id: string, dto: UpdateMediaDto) {
    const m = await this.prisma.media.update({ where: { id }, data: { alt: dto.alt } });
    this.cache.invalidate({ entity: "media" });
    return m;
  }

  async remove(id: string) {
    const m = await this.prisma.media.findUnique({ where: { id }, include: usageCount });
    if (!m) throw new NotFoundException("Image not found");
    const uses = Object.values(m._count).reduce((a, b) => a + b, 0);
    if (uses > 0) {
      throw new ConflictException(`This image is used in ${uses} place(s). Remove it there first.`);
    }
    await this.prisma.media.delete({ where: { id } });
    // Seeded sample images live outside our bucket; only delete our own uploads.
    if (m.key.startsWith("uploads/") && this.storage.configured) await this.storage.remove(m.key);
    return { id };
  }
}
