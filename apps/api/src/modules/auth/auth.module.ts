import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import type { Env } from "../../config/env.schema.js";
import { NotificationsService } from "../notifications/notifications.service.js";
import { AdminMeController, AuthController } from "./auth.controller.js";
import { AuthService, SESSION_TTL_SECONDS } from "./auth.service.js";

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true, // JwtAuthGuard is used by every admin module
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get("JWT_SECRET", { infer: true }),
        signOptions: { expiresIn: SESSION_TTL_SECONDS },
      }),
    }),
  ],
  controllers: [AuthController, AdminMeController],
  providers: [AuthService, NotificationsService],
})
export class AuthModule {}
