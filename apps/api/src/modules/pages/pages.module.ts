import { Body, Controller, Get, Module, Param, Patch } from "@nestjs/common";

import { AdminApi } from "../../common/admin.decorator.js";
import { UpdatePageDto } from "./pages.dto.js";
import { PagesService } from "./pages.service.js";

@AdminApi("pages")
@Controller("admin/pages")
export class PagesController {
  constructor(private readonly pages: PagesService) {}

  @Get() list() {
    return this.pages.list();
  }

  @Get(":key") get(@Param("key") key: string) {
    return this.pages.get(key);
  }

  @Patch(":key") update(@Param("key") key: string, @Body() dto: UpdatePageDto) {
    return this.pages.update(key, dto);
  }
}

@Module({ controllers: [PagesController], providers: [PagesService] })
export class PagesModule {}
