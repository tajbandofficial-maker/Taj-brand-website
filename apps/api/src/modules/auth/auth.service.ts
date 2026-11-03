import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";

import type { AdminJwtPayload } from "../../common/guards/jwt-auth.guard.js";
import { PrismaService } from "../../prisma/prisma.service.js";

export const BCRYPT_COST = 12;
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

// Compared against when the email is unknown, so timing doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_COST);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

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
