import { Module } from "@nestjs/common";

import {
  AddOnsController,
  ComparisonController,
  PackagesController,
} from "./packages.controller.js";
import { PackagesService } from "./packages.service.js";

@Module({
  controllers: [PackagesController, AddOnsController, ComparisonController],
  providers: [PackagesService],
})
export class PackagesModule {}
