import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { Env } from "../../config/env.schema.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { chunk, type InvalidationEvent, planInvalidation } from "./invalidation-plan.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * After an admin write commits: revalidate Next's Data Cache first, then purge
 * Cloudflare (reverse order would let the edge re-cache stale HTML). Failures
 * are logged and retried, never surfaced to the admin request.
 */
@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly prisma: PrismaService,
  ) {}

  /** Fire-and-forget; call after the DB transaction has committed. */
  invalidate(event: InvalidationEvent): void {
    void this.run(event).catch((err) => this.logger.error({ err, event }, "Invalidation failed"));
  }

  async run(event: InvalidationEvent): Promise<void> {
    const slugs = (await this.prisma.service.findMany({ select: { slug: true } })).map(
      (s) => s.slug,
    );
    const plan = planInvalidation(event, slugs);

    await this.withRetry("revalidate", () => this.revalidateNext(plan.tags));
    await this.withRetry("purge", () => this.purgeCloudflare(plan.purge));
    this.logger.log({ event: event.entity, tags: plan.tags }, "Cache invalidated");
  }

  private async revalidateNext(tags: string[]): Promise<void> {
    const res = await fetch(
      `${this.config.get("WEB_INTERNAL_URL", { infer: true })}/api/revalidate`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-revalidate-secret": this.config.get("REVALIDATE_SECRET", { infer: true }),
        },
        body: JSON.stringify({ tags }),
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) throw new Error(`Next revalidate responded ${res.status}`);
  }

  private async purgeCloudflare(purge: string[] | "everything"): Promise<void> {
    const zone = this.config.get("CLOUDFLARE_ZONE_ID", { infer: true });
    const token = this.config.get("CLOUDFLARE_API_TOKEN", { infer: true });
    if (!zone || !token) return; // not configured (development)

    const base = this.config.get("PUBLIC_SITE_URL", { infer: true }).replace(/\/$/, "");
    const bodies =
      purge === "everything"
        ? [{ purge_everything: true }]
        : chunk(purge.map((p) => `${base}${p}`)).map((files) => ({ files }));

    for (const body of bodies) {
      const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`Cloudflare purge responded ${res.status}`);
    }
  }

  private async withRetry(label: string, fn: () => Promise<void>, attempts = 3): Promise<void> {
    for (let i = 1; ; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i >= attempts) throw err;
        this.logger.warn({ err: String(err), attempt: i }, `${label} failed, retrying`);
        await sleep(500 * 2 ** (i - 1));
      }
    }
  }
}
