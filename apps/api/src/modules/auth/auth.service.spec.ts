import { UnauthorizedException } from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { AuthService } from "./auth.service.js";

const hash = bcrypt.hashSync("correct horse battery", 4);
const user = { id: "u1", email: "admin@tajband.local", passwordHash: hash, name: "Admin" };

function makeService(found: typeof user | null) {
  const prisma = {
    adminUser: {
      findUnique: vi.fn().mockResolvedValue(found),
      update: vi.fn().mockResolvedValue(found),
    },
  } as unknown as PrismaService;
  const jwt = { signAsync: vi.fn().mockResolvedValue("signed.jwt") } as unknown as JwtService;
  return { service: new AuthService(prisma, jwt), prisma, jwt };
}

describe("AuthService.login", () => {
  it("returns a token for valid credentials and records the login", async () => {
    const { service, prisma } = makeService(user);
    const res = await service.login("ADMIN@tajband.local", "correct horse battery");
    expect(res.accessToken).toBe("signed.jwt");
    expect(prisma.adminUser.findUnique).toHaveBeenCalledWith({
      where: { email: "admin@tajband.local" },
    });
    expect(prisma.adminUser.update).toHaveBeenCalled();
  });

  it("rejects a wrong password with a generic message", async () => {
    const { service } = makeService(user);
    await expect(service.login(user.email, "wrong")).rejects.toThrow(
      new UnauthorizedException("Invalid email or password"),
    );
  });

  it("rejects an unknown email with the same message", async () => {
    const { service } = makeService(null);
    await expect(service.login("nobody@x.com", "whatever")).rejects.toThrow(
      "Invalid email or password",
    );
  });
});
