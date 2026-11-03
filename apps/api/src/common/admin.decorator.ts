import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";

/** Marks a controller as admin-only (JWT) and groups it in Swagger. */
export function AdminApi(tag: string) {
  return applyDecorators(UseGuards(JwtAuthGuard), ApiBearerAuth(), ApiTags(`admin · ${tag}`));
}
