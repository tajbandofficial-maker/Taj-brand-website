import { Body, Controller, Get, Module, Patch } from "@nestjs/common";

import { AdminApi } from "../../common/admin.decorator.js";
import { UpdateSettingsDto } from "./settings.dto.js";
import { SettingsService } from "./settings.service.js";

@AdminApi("settings")
@Controller("admin/settings")
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get() get() {
    return this.settings.get();
  }

  @Patch() update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto);
  }
}

@Module({ controllers: [SettingsController], providers: [SettingsService] })
export class SettingsModule {}
