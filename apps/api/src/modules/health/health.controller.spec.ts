import { ServiceUnavailableException } from "@nestjs/common";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { HealthController } from "./health.controller.js";

function controllerWith(queryRaw: () => Promise<unknown>) {
  return new HealthController({ $queryRaw: queryRaw } as unknown as PrismaService);
}

describe("HealthController", () => {
  it("reports ok when the database answers", async () => {
    await expect(controllerWith(async () => [{ ok: 1 }]).check()).resolves.toEqual({
      status: "ok",
      db: "up",
    });
  });

  it("returns 503 when the database is unreachable", async () => {
    const controller = controllerWith(async () => {
      throw new Error("ECONNREFUSED");
    });
    await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
