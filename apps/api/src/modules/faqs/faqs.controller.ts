import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

import { AdminApi } from "../../common/admin.decorator.js";
import { ReorderDto } from "../../common/dto/reorder.dto.js";
import { CreateFaqDto, UpdateFaqDto } from "./faqs.dto.js";
import { FaqsService } from "./faqs.service.js";

@AdminApi("faqs")
@Controller("admin/faqs")
export class FaqsController {
  constructor(private readonly faqs: FaqsService) {}

  @Get()
  @ApiQuery({ name: "serviceId", required: false })
  list(@Query("serviceId") serviceId?: string) {
    return this.faqs.list(serviceId);
  }
  @Patch("reorder") reorder(@Body() dto: ReorderDto) {
    return this.faqs.reorder(dto.ids);
  }
  @Get(":id") get(@Param("id") id: string) {
    return this.faqs.get(id);
  }
  @Post() create(@Body() dto: CreateFaqDto) {
    return this.faqs.create(dto);
  }
  @Patch(":id") update(@Param("id") id: string, @Body() dto: UpdateFaqDto) {
    return this.faqs.update(id, dto);
  }
  @Delete(":id") remove(@Param("id") id: string) {
    return this.faqs.remove(id);
  }
}
