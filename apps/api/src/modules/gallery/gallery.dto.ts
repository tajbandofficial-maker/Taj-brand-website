import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, Matches } from "class-validator";

import { Flag, OptionalId, OptionalText } from "../../common/dto/validators.js";
import { GalleryCategory, GalleryType } from "../../generated/prisma/client.js";

export class CreateGalleryItemDto {
  @ApiProperty({ enum: GalleryType }) @IsEnum(GalleryType) type!: GalleryType;
  @ApiProperty({ enum: GalleryCategory }) @IsEnum(GalleryCategory) category!: GalleryCategory;
  /** Required for IMAGE; optional poster for VIDEO. */
  @OptionalId() mediaId?: string | null;

  /** 11-character YouTube video id; required for VIDEO. */
  @ApiPropertyOptional({ nullable: true, example: "dQw4w9WgXcQ" })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{11}$/, { message: "youtubeId must be an 11-character YouTube video id" })
  youtubeId?: string | null;

  @OptionalText(160) caption?: string | null;
  @OptionalId() serviceId?: string | null;
  @Flag() published?: boolean;
}
export class UpdateGalleryItemDto extends PartialType(CreateGalleryItemDto) {}
