import { PartialType } from "@nestjs/swagger";

import {
  Flag,
  IdList,
  OptionalId,
  OptionalPrice,
  OptionalText,
  RequiredText,
  Slug,
  StringList,
} from "../../common/dto/validators.js";

export class CreatePackageDto {
  @Slug() slug!: string;
  @RequiredText(60) name!: string;
  @OptionalText(120) tagline?: string | null;
  @OptionalPrice() startingPrice?: number | null;
  @OptionalText(120) priceNote?: string | null;
  @StringList(20, 160) inclusions!: string[];
  @Flag() highlighted?: boolean;
  @Flag() published?: boolean;
  @IdList() serviceIds?: string[];
}
export class UpdatePackageDto extends PartialType(CreatePackageDto) {}

export class CreateAddOnDto {
  @RequiredText(80) name!: string;
  @OptionalText(300) description?: string | null;
  @OptionalPrice() startingPrice?: number | null;
  @OptionalId() serviceId?: string | null;
  @Flag() published?: boolean;
}
export class UpdateAddOnDto extends PartialType(CreateAddOnDto) {}

export class CreateComparisonRowDto {
  @RequiredText(80) label!: string;
  /** One value per published package, in package order. */
  @StringList(30, 80) values!: string[];
}
export class UpdateComparisonRowDto extends PartialType(CreateComparisonRowDto) {}
