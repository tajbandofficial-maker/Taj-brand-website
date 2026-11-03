import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";

import { type Env, validateEnv } from "./config/env.schema.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { CacheInvalidationModule } from "./modules/cache-invalidation/cache-invalidation.module.js";
import { FaqsModule } from "./modules/faqs/faqs.module.js";
import { GalleryModule } from "./modules/gallery/gallery.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { InquiriesModule } from "./modules/inquiries/inquiries.module.js";
import { MediaModule } from "./modules/media/media.module.js";
import { PackagesModule } from "./modules/packages/packages.module.js";
import { PagesModule } from "./modules/pages/pages.module.js";
import { PublicModule } from "./modules/public/public.module.js";
import { ReviewsModule } from "./modules/reviews/reviews.module.js";
import { ServicesModule } from "./modules/services/services.module.js";
import { SettingsModule } from "./modules/settings/settings.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const isProd = config.get("NODE_ENV", { infer: true }) === "production";
        return {
          pinoHttp: {
            level: isProd ? "info" : "debug",
            // JSON logs in prod; human-readable in dev.
            transport: isProd
              ? undefined
              : { target: "pino-pretty", options: { singleLine: true } },
            autoLogging: { ignore: (req) => req.url === "/health" },
            // Never log credentials or session tokens.
            redact: [
              "req.headers.authorization",
              "req.headers['x-internal-token']",
              "req.headers.cookie",
            ],
          },
        };
      },
    }),
    // Limits are applied per route (login, inquiries) via IpThrottlerGuard.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    CacheInvalidationModule,
    HealthModule,
    AuthModule,
    PublicModule,
    ServicesModule,
    PackagesModule,
    GalleryModule,
    ReviewsModule,
    FaqsModule,
    SettingsModule,
    PagesModule,
    InquiriesModule,
    MediaModule,
  ],
})
export class AppModule {}
