import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { Logger } from "nestjs-pino";

import { AppModule } from "./app.module.js";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter.js";
import type { Env } from "./config/env.schema.js";

async function bootstrap() {
  // CORS stays disabled: only Next.js (server-side) talks to this API.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  const config = app.get<ConfigService<Env, true>>(ConfigService);
  if (config.get("SWAGGER_ENABLED", { infer: true })) {
    const doc = new DocumentBuilder()
      .setTitle("Taj Band API")
      .setDescription("Internal API — reachable only from the Next.js server.")
      .addBearerAuth()
      .addApiKey({ type: "apiKey", name: "x-internal-token", in: "header" }, "internal")
      .build();
    SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, doc));
  }

  await app.listen(config.get("PORT", { infer: true }));
}

await bootstrap();
