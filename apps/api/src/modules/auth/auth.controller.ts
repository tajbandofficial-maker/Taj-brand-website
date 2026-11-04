import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { AdminApi } from "../../common/admin.decorator.js";
import { IpThrottlerGuard } from "../../common/guards/ip-throttler.guard.js";
import { type AuthedRequest, JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { ForgotPasswordDto, LoginDto, ResetPasswordDto } from "./auth.dto.js";
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

  /**
   * Emails a reset link to the official inbox. Same reply whether or not the email has an
   * account; 3 requests per 10 minutes per visitor IP.
   */
  @Post("forgot-password")
  @HttpCode(202)
  @UseGuards(IpThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 600_000 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.auth.forgotPassword(dto.email);
    return { ok: true };
  }

  /** Sets a new password from a reset link. 10 attempts per 10 minutes per visitor IP. */
  @Post("reset-password")
  @HttpCode(200)
  @UseGuards(IpThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.password);
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
