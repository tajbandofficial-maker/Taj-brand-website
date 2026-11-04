import { BadRequestException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";

import type { AdminJwtPayload } from "../../common/guards/jwt-auth.guard.js";
import type { Env } from "../../config/env.schema.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { NotificationsService } from "../notifications/notifications.service.js";

export const BCRYPT_COST = 12;
export const SESSION_TTL_SECONDS = 8 * 60 * 60;
export const RESET_TTL_MINUTES = 30;
const RESET_PURPOSE = "password-reset";

type ResetPayload = { sub: string; purpose: typeof RESET_PURPOSE };

// Compared against when the email is unknown, so timing doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_COST);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Reset tokens are signed with JWT_SECRET + the account's current password hash, so a link
   * stops working as soon as the password changes: single use, with nothing stored.
   */
  private resetSecret(passwordHash: string): string {
    return `${this.config.get("JWT_SECRET", { infer: true })}:reset:${passwordHash}`;
  }

  /**
   * Emails a reset link for `email` to the official inbox. Always resolves the same way, so
   * the sign-in page never reveals which emails have an account.
   */
  async forgotPassword(email: string): Promise<void> {
    const typed = email.trim().toLowerCase();
    const user = await this.prisma.adminUser.findUnique({ where: { email: typed } });
    // The official inbox's own address also works: it gets a link for each admin account
    // (the sign-in email, e.g. admin@tajband.local, is easy to forget).
    const users = user
      ? [user]
      : (await this.isOfficialInbox(typed))
        ? await this.prisma.adminUser.findMany({ orderBy: { createdAt: "asc" }, take: 5 })
        : [];
    if (users.length === 0) {
      this.logger.warn("Password reset asked for an unknown email — ignored");
      return;
    }
    const site = this.config.get("PUBLIC_SITE_URL", { infer: true }).replace(/\/+$/, "");
    for (const u of users) {
      const payload: ResetPayload = { sub: u.id, purpose: RESET_PURPOSE };
      const token = await this.jwt.signAsync(payload, {
        secret: this.resetSecret(u.passwordHash),
        expiresIn: RESET_TTL_MINUTES * 60,
      });
      const link = `${site}/admin/reset-password?token=${encodeURIComponent(token)}`;
      // Not awaited: a slower reply for real accounts would reveal which emails exist.
      void this.notifications.passwordReset(u.email, link, RESET_TTL_MINUTES);
    }
  }

  /** True when `email` is the official inbox the reset links are sent to. */
  private async isOfficialInbox(email: string): Promise<boolean> {
    const official = await this.notifications.officialInbox().catch(() => null);
    return Boolean(official) && official!.toLowerCase() === email;
  }

  /** Sets a new password when `token` is a valid, unexpired, unused reset link. */
  async resetPassword(token: string, password: string): Promise<{ email: string }> {
    const invalid = () =>
      new BadRequestException("This reset link is invalid or has expired. Ask for a new one.");
    const claimed = this.jwt.decode<Partial<ResetPayload> | null>(token);
    if (!claimed?.sub || claimed.purpose !== RESET_PURPOSE) throw invalid();

    const user = await this.prisma.adminUser.findUnique({ where: { id: claimed.sub } });
    if (!user) throw invalid();
    try {
      await this.jwt.verifyAsync<ResetPayload>(token, {
        secret: this.resetSecret(user.passwordHash),
      });
    } catch {
      throw invalid();
    }

    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(password, BCRYPT_COST) },
    });
    this.logger.log({ adminId: user.id }, "Admin password reset");
    return { email: user.email };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; expiresAt: string }> {
    const user = await this.prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
    const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) throw new UnauthorizedException("Invalid email or password");

    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    const payload: AdminJwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: SESSION_TTL_SECONDS });
    return {
      accessToken,
      expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString(),
    };
  }

  async me(id: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, lastLoginAt: true },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
