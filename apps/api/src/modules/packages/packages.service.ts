import { Injectable, NotFoundException } from "@nestjs/common";

import { linkMany, linkOne } from "../../common/prisma-relations.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CacheInvalidationService } from "../cache-invalidation/cache-invalidation.service.js";
import type {
  CreateAddOnDto,
  CreateComparisonRowDto,
  CreatePackageDto,
  UpdateAddOnDto,
  UpdateComparisonRowDto,
  UpdatePackageDto,
} from "./packages.dto.js";

const packageInclude = { services: { select: { id: true, title: true } } } as const;
const addOnInclude = { service: { select: { id: true, slug: true, title: true } } } as const;

@Injectable()
export class PackagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheInvalidationService,
  ) {}

  private touched(entity: "package" | "addon" | "comparison") {
    this.cache.invalidate({ entity });
  }

  // ── Packages ──────────────────────────────────────────────
  listPackages() {
    return this.prisma.package.findMany({ orderBy: { order: "asc" }, include: packageInclude });
  }

  async getPackage(id: string) {
    const p = await this.prisma.package.findUnique({ where: { id }, include: packageInclude });
    if (!p) throw new NotFoundException("Package not found");
    return p;
  }

  async createPackage({ serviceIds, ...data }: CreatePackageDto) {
    const last = await this.prisma.package.aggregate({ _max: { order: true } });
    const p = await this.prisma.package.create({
      data: {
        ...data,
        order: (last._max.order ?? -1) + 1,
        services: linkMany(serviceIds, "create"),
      },
      include: packageInclude,
    });
    this.touched("package");
    return p;
  }

  async updatePackage(id: string, { serviceIds, ...data }: UpdatePackageDto) {
    const p = await this.prisma.package.update({
      where: { id },
      data: { ...data, services: linkMany(serviceIds, "update") },
      include: packageInclude,
    });
    this.touched("package");
    return p;
  }

  async removePackage(id: string) {
    await this.prisma.package.delete({ where: { id } });
    this.touched("package");
    return { id };
  }

  async reorderPackages(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, order) => this.prisma.package.update({ where: { id }, data: { order } })),
    );
    this.touched("package");
    return { ok: true };
  }

  // ── Add-ons ───────────────────────────────────────────────
  listAddOns() {
    return this.prisma.addOn.findMany({ orderBy: { order: "asc" }, include: addOnInclude });
  }

  async getAddOn(id: string) {
    const a = await this.prisma.addOn.findUnique({ where: { id }, include: addOnInclude });
    if (!a) throw new NotFoundException("Add-on not found");
    return a;
  }

  async createAddOn({ serviceId, ...data }: CreateAddOnDto) {
    const last = await this.prisma.addOn.aggregate({ _max: { order: true } });
    const a = await this.prisma.addOn.create({
      data: { ...data, order: (last._max.order ?? -1) + 1, service: linkOne(serviceId, "create") },
      include: addOnInclude,
    });
    this.touched("addon");
    return a;
  }

  async updateAddOn(id: string, { serviceId, ...data }: UpdateAddOnDto) {
    const a = await this.prisma.addOn.update({
      where: { id },
      data: { ...data, service: linkOne(serviceId, "update") },
      include: addOnInclude,
    });
    this.touched("addon");
    return a;
  }

  async removeAddOn(id: string) {
    await this.prisma.addOn.delete({ where: { id } });
    this.touched("addon");
    return { id };
  }

  async reorderAddOns(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, order) => this.prisma.addOn.update({ where: { id }, data: { order } })),
    );
    this.touched("addon");
    return { ok: true };
  }

  // ── Comparison rows ───────────────────────────────────────
  listRows() {
    return this.prisma.packageComparisonRow.findMany({ orderBy: { order: "asc" } });
  }

  async getRow(id: string) {
    const r = await this.prisma.packageComparisonRow.findUnique({ where: { id } });
    if (!r) throw new NotFoundException("Comparison row not found");
    return r;
  }

  async createRow(dto: CreateComparisonRowDto) {
    const last = await this.prisma.packageComparisonRow.aggregate({ _max: { order: true } });
    const r = await this.prisma.packageComparisonRow.create({
      data: { ...dto, order: (last._max.order ?? -1) + 1 },
    });
    this.touched("comparison");
    return r;
  }

  async updateRow(id: string, dto: UpdateComparisonRowDto) {
    const r = await this.prisma.packageComparisonRow.update({ where: { id }, data: dto });
    this.touched("comparison");
    return r;
  }

  async removeRow(id: string) {
    await this.prisma.packageComparisonRow.delete({ where: { id } });
    this.touched("comparison");
    return { id };
  }

  async reorderRows(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, order) =>
        this.prisma.packageComparisonRow.update({ where: { id }, data: { order } }),
      ),
    );
    this.touched("comparison");
    return { ok: true };
  }
}
