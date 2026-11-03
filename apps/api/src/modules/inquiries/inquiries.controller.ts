import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Request } from "express";

import { AdminApi } from "../../common/admin.decorator.js";
import { InternalOnlyGuard } from "../../common/guards/internal-only.guard.js";
import { IpThrottlerGuard } from "../../common/guards/ip-throttler.guard.js";
import { ListInquiriesQuery, PublicInquiryDto, UpdateInquiryDto } from "./inquiries.dto.js";
import { InquiriesService } from "./inquiries.service.js";

@ApiTags("public")
@Controller("public/inquiries")
@UseGuards(InternalOnlyGuard)
export class PublicInquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  /** 5 submissions per 10 minutes per visitor IP (§7.4). */
  @Post()
  @HttpCode(200)
  @UseGuards(IpThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 10 * 60_000 } })
  submit(@Body() dto: PublicInquiryDto, @Req() req: Request) {
    return this.inquiries.submit(dto, req.header("cf-connecting-ip") ?? null);
  }
}

@AdminApi("inquiries")
@Controller("admin/inquiries")
export class AdminInquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Get() list(@Query() query: ListInquiriesQuery) {
    return this.inquiries.list(query);
  }
  @Get(":id") get(@Param("id") id: string) {
    return this.inquiries.get(id);
  }
  /** Status + notes only — inquiries are created by visitors, never in the admin. */
  @Patch(":id") update(@Param("id") id: string, @Body() dto: UpdateInquiryDto) {
    return this.inquiries.update(id, dto);
  }
}

@AdminApi("dashboard")
@Controller("admin/stats")
export class StatsController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Get() stats() {
    return this.inquiries.stats();
  }
}
