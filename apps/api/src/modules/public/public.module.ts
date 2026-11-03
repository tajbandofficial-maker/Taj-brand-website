import { Controller, Get, Module, Param, ParseEnumPipe, Query, UseGuards } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";

import { InternalOnlyGuard } from "../../common/guards/internal-only.guard.js";
import { GalleryCategory, ReviewSource } from "../../generated/prisma/client.js";
import { PublicService } from "./public.service.js";

/** Public site reads — callable only by the Next.js server (X-Internal-Token). */
@ApiTags("public")
@Controller("public")
@UseGuards(InternalOnlyGuard)
export class PublicController {
  constructor(private readonly pub: PublicService) {}

  @Get("settings") settings() {
    return this.pub.settings();
  }

  @Get("services") services() {
    return this.pub.services();
  }

  @Get("services/:slug") service(@Param("slug") slug: string) {
    return this.pub.service(slug);
  }

  @Get("packages") packages() {
    return this.pub.packages();
  }

  @Get("packages/comparison") comparison() {
    return this.pub.comparison();
  }

  @Get("addons") addOns() {
    return this.pub.addOns();
  }

  @Get("gallery")
  @ApiQuery({ name: "category", enum: GalleryCategory, required: false })
  gallery(
    @Query("category", new ParseEnumPipe(GalleryCategory, { optional: true }))
    category?: GalleryCategory,
  ) {
    return this.pub.gallery(category);
  }

  @Get("videos") videos() {
    return this.pub.videos();
  }

  @Get("reviews")
  @ApiQuery({ name: "featured", required: false, type: Boolean })
  @ApiQuery({ name: "source", enum: ReviewSource, required: false })
  reviews(
    @Query("featured") featured?: string,
    @Query("source", new ParseEnumPipe(ReviewSource, { optional: true })) source?: ReviewSource,
  ) {
    return this.pub.reviews({ featured: featured === "true", source });
  }

  @Get("pages/:key") page(@Param("key") key: string) {
    return this.pub.page(key);
  }

  @Get("faqs") faqs() {
    return this.pub.globalFaqs();
  }

  @Get("sitemap") sitemap() {
    return this.pub.sitemap();
  }
}

@Module({ controllers: [PublicController], providers: [PublicService] })
export class PublicModule {}
