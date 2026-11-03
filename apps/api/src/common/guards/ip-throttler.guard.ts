import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { Request } from "express";

/**
 * Every request reaches the API from the Next.js server, so throttle on the
 * visitor IP that Next forwards (Cloudflare's CF-Connecting-IP).
 */
@Injectable()
export class IpThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(req: Record<string, unknown>): Promise<string> {
    const r = req as unknown as Request;
    return r.header("cf-connecting-ip") ?? r.ip ?? "unknown";
  }
}
