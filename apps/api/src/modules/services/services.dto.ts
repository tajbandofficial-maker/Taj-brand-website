import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";

import {
  Flag,
  IdList,
  OptionalId,
  OptionalText,
  RequiredText,
  Slug,
  StringList,
} from "../../common/dto/validators.js";

export class ServiceSectionDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(120) heading!: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(4000) body!: string;
}

export class CreateServiceDto {
  @Slug() slug!: string;
  @RequiredText(80) title!: string;
  @RequiredText(160) h1!: string;
  @RequiredText(300) shortDescription!: string;
  @RequiredText(1500) intro!: string;

  @ApiProperty({ type: [ServiceSectionDto] })
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => ServiceSectionDto)
  sections!: ServiceSectionDto[];

  @StringList(20, 160) inclusions!: string[];
  @OptionalText(1500) areaCopy?: string | null;
  @OptionalId() heroImageId?: string | null;
  @OptionalText(70) seoTitle?: string | null;
  @OptionalText(170) seoDescription?: string | null;
  @OptionalId() ogImageId?: string | null;
  @Flag() published?: boolean;
  @IdList() relatedPackageIds?: string[];
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
