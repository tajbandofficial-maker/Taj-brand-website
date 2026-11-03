import { Module } from "@nestjs/common";

import { NotificationsService } from "../notifications/notifications.service.js";
import {
  AdminInquiriesController,
  PublicInquiriesController,
  StatsController,
} from "./inquiries.controller.js";
import { InquiriesService } from "./inquiries.service.js";

@Module({
  controllers: [PublicInquiriesController, AdminInquiriesController, StatsController],
  providers: [InquiriesService, NotificationsService],
})
export class InquiriesModule {}
