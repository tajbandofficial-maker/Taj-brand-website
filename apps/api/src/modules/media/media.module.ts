import { Body, Controller, Delete, Get, Module, Param, Patch, Post } from "@nestjs/common";

import { AdminApi } from "../../common/admin.decorator.js";
import { CreateMediaDto, PresignDto, UpdateMediaDto } from "./media.dto.js";
import { MediaService } from "./media.service.js";
import { StorageService } from "./storage.service.js";

@AdminApi("media")
@Controller("admin/media")
export class MediaController {
  constructor(private readonly media: MediaService) {}

  /** Step 1: get a 5-minute presigned PUT URL; the browser uploads directly to storage. */
  @Post("presign") presign(@Body() dto: PresignDto) {
    return this.media.presign(dto);
  }

  /** Step 2: record the uploaded image (with required alt text). */
  @Post() create(@Body() dto: CreateMediaDto) {
    return this.media.create(dto);
  }

  @Get() list() {
    return this.media.list();
  }

  @Patch(":id") update(@Param("id") id: string, @Body() dto: UpdateMediaDto) {
    return this.media.updateAlt(id, dto);
  }

  @Delete(":id") remove(@Param("id") id: string) {
    return this.media.remove(id);
  }
}

@Module({ controllers: [MediaController], providers: [MediaService, StorageService] })
export class MediaModule {}
