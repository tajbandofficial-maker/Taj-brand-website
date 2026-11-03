import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";

import { Flag, OptionalId, OptionalText, RequiredText } from "../../common/dto/validators.js";
import { ReviewSource } from "../../generated/prisma/client.js";

export class CreateReviewDto {
  @RequiredText(80) author!: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @RequiredText(2000) text!: string;
  @OptionalText(120) meta?: string | null;
  @ApiProperty({ enum: ReviewSource }) @IsEnum(ReviewSource) source!: ReviewSource;
  @OptionalId() imageId?: string | null;

  @ApiPropertyOptional({ nullable: true, example: "2025-11-24" })
  @IsOptional()
  @IsDateString()
  eventDate?: string | null;

  @Flag() featured?: boolean;
  @Flag() published?: boolean;
}
export class UpdateReviewDto extends PartialType(CreateReviewDto) {}
