import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { AdminApi } from "../../common/admin.decorator.js";
import { ReorderDto } from "../../common/dto/reorder.dto.js";
import { CreateServiceDto, UpdateServiceDto } from "./services.dto.js";
import { ServicesService } from "./services.service.js";

@AdminApi("services")
@Controller("admin/services")
export class ServicesController {
  constructor(private readonly services: ServicesService) {}

  @Get() list() {
    return this.services.list();
  }

  // Declared before ":id" so "reorder" isn't captured as an id.
  @Patch("reorder") reorder(@Body() dto: ReorderDto) {
    return this.services.reorder(dto.ids);
  }

  @Get(":id") get(@Param("id") id: string) {
    return this.services.get(id);
  }

  @Post() create(@Body() dto: CreateServiceDto) {
    return this.services.create(dto);
  }

  @Patch(":id") update(@Param("id") id: string, @Body() dto: UpdateServiceDto) {
    return this.services.update(id, dto);
  }

  @Delete(":id") remove(@Param("id") id: string) {
    return this.services.remove(id);
  }
}
