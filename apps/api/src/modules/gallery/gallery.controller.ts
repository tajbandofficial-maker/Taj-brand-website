import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

import { AdminApi } from "../../common/admin.decorator.js";
import { ReorderDto } from "../../common/dto/reorder.dto.js";
import { GalleryCategory } from "../../generated/prisma/client.js";
import { CreateGalleryItemDto, UpdateGalleryItemDto } from "./gallery.dto.js";
import { GalleryService } from "./gallery.service.js";

@AdminApi("gallery")
@Controller("admin/gallery")
export class GalleryController {
  constructor(private readonly gallery: GalleryService) {}

  @Get()
  @ApiQuery({ name: "category", enum: GalleryCategory, required: false })
  list(
    @Query("category", new ParseEnumPipe(GalleryCategory, { optional: true }))
    category?: GalleryCategory,
  ) {
    return this.gallery.list(category);
  }

  @Patch("reorder") reorder(@Body() dto: ReorderDto) {
    return this.gallery.reorder(dto.ids);
  }
  @Get(":id") get(@Param("id") id: string) {
    return this.gallery.get(id);
  }
  @Post() create(@Body() dto: CreateGalleryItemDto) {
    return this.gallery.create(dto);
  }
  @Patch(":id") update(@Param("id") id: string, @Body() dto: UpdateGalleryItemDto) {
    return this.gallery.update(id, dto);
  }
  @Delete(":id") remove(@Param("id") id: string) {
    return this.gallery.remove(id);
  }
}
