import { UnauthorizedException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";

import type { Env } from "../../config/env.schema.js";
import type { PrismaService } from "../../prisma/prisma.service.js";
import type { NotificationsService } from "../notifications/notifications.service.js";
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
  const config = {
    get: (k: string) =>
      ({ JWT_SECRET: "test-secret-0123456789", PUBLIC_SITE_URL: "https://tajband.test/" })[k],
  } as unknown as ConfigService<Env, true>;
  const notifications = {
    passwordReset: vi.fn().mockResolvedValue(true),
  } as unknown as NotificationsService;
  return { service: new AuthService(prisma, jwt, config, notifications), prisma, jwt };
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

describe("AuthService password reset", () => {
  // Real JWT signing; the "database" keeps whatever hash was last saved.
  function makeResetService() {
    let current = { ...user };
    const prisma = {
      adminUser: {
        findUnique: vi.fn(async ({ where }: { where: { id?: string; email?: string } }) =>
          where.id === current.id || where.email === current.email ? current : null,
        ),
        findMany: vi.fn(async () => [current]),
        update: vi.fn(async ({ data }: { data: { passwordHash: string } }) => {
          current = { ...current, ...data };
          return current;
        }),
      },
    } as unknown as PrismaService;
    const config = {
      get: (k: string) =>
        ({ JWT_SECRET: "test-secret-0123456789", PUBLIC_SITE_URL: "https://tajband.test/" })[k],
    } as unknown as ConfigService<Env, true>;
    const passwordReset = vi.fn().mockResolvedValue(true);
    const officialInbox = vi.fn().mockResolvedValue("TajBandOfficial@gmail.com");
    const jwt = new JwtService({ secret: "test-secret-0123456789" });
    const service = new AuthService(prisma, jwt, config, {
      passwordReset,
      officialInbox,
    } as unknown as NotificationsService);
    return { service, passwordReset, jwt, hash: () => current.passwordHash };
  }

  const tokenFrom = (link: string) => new URL(link).searchParams.get("token")!;

  it("emails a link for a known account and ignores unknown emails", async () => {
    const { service, passwordReset } = makeResetService();
    await service.forgotPassword("nobody@example.com");
    expect(passwordReset).not.toHaveBeenCalled();

    await service.forgotPassword("ADMIN@tajband.local");
    expect(passwordReset).toHaveBeenCalledOnce();
    const [email, link, minutes] = passwordReset.mock.calls[0]!;
    expect(email).toBe(user.email);
    expect(link).toMatch(/^https:\/\/tajband\.test\/admin\/reset-password\?token=/);
    expect(minutes).toBe(30);
  });

  it("accepts the official inbox's address and sends a link for the admin account", async () => {
    const { service, passwordReset } = makeResetService();
    await service.forgotPassword(" tajbandofficial@gmail.com ");
    expect(passwordReset).toHaveBeenCalledOnce();
    expect(passwordReset.mock.calls[0]![0]).toBe(user.email);
  });

  it("sets the new password once; the same link then stops working", async () => {
    const { service, passwordReset, hash } = makeResetService();
    await service.forgotPassword(user.email);
    const token = tokenFrom(passwordReset.mock.calls[0]![1] as string);

    await expect(service.resetPassword(token, "brand new password")).resolves.toEqual({
      email: user.email,
    });
    expect(bcrypt.compareSync("brand new password", hash())).toBe(true);
    await expect(service.resetPassword(token, "another password")).rejects.toThrow(
      /invalid or has expired/,
    );
  });

  it("rejects a session token or a garbage token", async () => {
    const { service, jwt } = makeResetService();
    const session = await jwt.signAsync({ sub: user.id, email: user.email });
    await expect(service.resetPassword(session, "brand new password")).rejects.toThrow(
      /invalid or has expired/,
    );
    await expect(
      service.resetPassword("not-a-token-at-all-xxxxxxxx", "brand new password"),
    ).rejects.toThrow(/invalid or has expired/);
  });
});
