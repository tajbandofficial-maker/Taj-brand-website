import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { AdminApi } from "../../common/admin.decorator.js";
import { ReorderDto } from "../../common/dto/reorder.dto.js";
import {
  CreateAddOnDto,
  CreateComparisonRowDto,
  CreatePackageDto,
  UpdateAddOnDto,
  UpdateComparisonRowDto,
  UpdatePackageDto,
} from "./packages.dto.js";
import { PackagesService } from "./packages.service.js";

@AdminApi("packages")
@Controller("admin/packages")
export class PackagesController {
  constructor(private readonly svc: PackagesService) {}

  @Get() list() {
    return this.svc.listPackages();
  }
  @Patch("reorder") reorder(@Body() dto: ReorderDto) {
    return this.svc.reorderPackages(dto.ids);
  }
  @Get(":id") get(@Param("id") id: string) {
    return this.svc.getPackage(id);
  }
  @Post() create(@Body() dto: CreatePackageDto) {
    return this.svc.createPackage(dto);
  }
  @Patch(":id") update(@Param("id") id: string, @Body() dto: UpdatePackageDto) {
    return this.svc.updatePackage(id, dto);
  }
  @Delete(":id") remove(@Param("id") id: string) {
    return this.svc.removePackage(id);
  }
}

@AdminApi("add-ons")
@Controller("admin/addons")
export class AddOnsController {
  constructor(private readonly svc: PackagesService) {}

  @Get() list() {
    return this.svc.listAddOns();
  }
  @Patch("reorder") reorder(@Body() dto: ReorderDto) {
    return this.svc.reorderAddOns(dto.ids);
  }
  @Get(":id") get(@Param("id") id: string) {
    return this.svc.getAddOn(id);
  }
  @Post() create(@Body() dto: CreateAddOnDto) {
    return this.svc.createAddOn(dto);
  }
  @Patch(":id") update(@Param("id") id: string, @Body() dto: UpdateAddOnDto) {
    return this.svc.updateAddOn(id, dto);
  }
  @Delete(":id") remove(@Param("id") id: string) {
    return this.svc.removeAddOn(id);
  }
}

@AdminApi("package comparison")
@Controller("admin/comparison")
export class ComparisonController {
  constructor(private readonly svc: PackagesService) {}

  @Get() list() {
    return this.svc.listRows();
  }
  @Patch("reorder") reorder(@Body() dto: ReorderDto) {
    return this.svc.reorderRows(dto.ids);
  }
  @Get(":id") get(@Param("id") id: string) {
    return this.svc.getRow(id);
  }
  @Post() create(@Body() dto: CreateComparisonRowDto) {
    return this.svc.createRow(dto);
  }
  @Patch(":id") update(@Param("id") id: string, @Body() dto: UpdateComparisonRowDto) {
    return this.svc.updateRow(id, dto);
  }
  @Delete(":id") remove(@Param("id") id: string) {
    return this.svc.removeRow(id);
  }
}
