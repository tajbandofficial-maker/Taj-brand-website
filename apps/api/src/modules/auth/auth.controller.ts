import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { AdminApi } from "../../common/admin.decorator.js";
import { IpThrottlerGuard } from "../../common/guards/ip-throttler.guard.js";
import { type AuthedRequest, JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { LoginDto } from "./auth.dto.js";
import { AuthService } from "./auth.service.js";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** 5 attempts per minute per visitor IP; generic error message on failure. */
  @Post("login")
  @HttpCode(200)
  @UseGuards(IpThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  me(@Req() req: AuthedRequest) {
    return this.auth.me(req.admin.sub);
  }
}

/** Same as /auth/me, under /admin so the Next BFF (which only proxies /admin/*) can reach it. */
@AdminApi("session")
@Controller("admin/me")
export class AdminMeController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  me(@Req() req: AuthedRequest) {
    return this.auth.me(req.admin.sub);
  }
}
