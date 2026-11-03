import { timingSafeEqual } from "node:crypto";

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";

import type { Env } from "../../config/env.schema.js";

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Public read routes: only the Next.js server (holding INTERNAL_API_TOKEN) may call them. */
@Injectable()
export class InternalOnlyGuard implements CanActivate {
  constructor(private readonly config: ConfigService<Env, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.header("x-internal-token") ?? "";
    if (!safeEqual(token, this.config.get("INTERNAL_API_TOKEN", { infer: true }))) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
