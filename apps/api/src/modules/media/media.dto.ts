import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from "class-validator";

import { RequiredText } from "../../common/dto/validators.js";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export class PresignDto {
  @ApiProperty({ example: "baraat-night.jpg" }) @IsString() @MaxLength(200) filename!: string;

  @ApiProperty({ enum: ALLOWED_IMAGE_TYPES })
  @IsIn(ALLOWED_IMAGE_TYPES, { message: "Only JPEG, PNG, WebP or AVIF images can be uploaded." })
  mimeType!: string;

  @ApiProperty({ maximum: MAX_UPLOAD_BYTES })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_UPLOAD_BYTES, { message: "Images must be 15 MB or smaller." })
  size!: number;

  /** Hex SHA-256 of the file (computed in the browser) → content-hashed key. */
  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^[a-f0-9]{64}$/)
  sha256?: string;
}

export class CreateMediaDto {
  @ApiProperty() @IsString() @Matches(/^uploads\/[\w./-]+$/) @MaxLength(300) key!: string;
  @ApiProperty({ enum: ALLOWED_IMAGE_TYPES }) @IsIn(ALLOWED_IMAGE_TYPES) mimeType!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20000)
  width?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20000)
  height?: number;
  /** Required: describes the image for screen readers and Google. */
  @RequiredText(200) alt!: string;
}

export class UpdateMediaDto {
  @RequiredText(200) alt!: string;
}
