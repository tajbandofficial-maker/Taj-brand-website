import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";

import { OptionalText, RequiredText } from "../../common/dto/validators.js";
import { InquiryStatus } from "../../generated/prisma/client.js";

/** Sent by the Next Server Action (already validated there; validated again here). */
export class PublicInquiryDto {
  @RequiredText(80) name!: string;

  @ApiProperty({ example: "919876543210" })
  @Matches(/^91[6-9]\d{9}$/, { message: "phone must be a normalised Indian mobile (91XXXXXXXXXX)" })
  phone!: string;

  @ApiPropertyOptional({ nullable: true, example: "riya@example.com" })
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string | null;

  @ApiPropertyOptional({ nullable: true, example: "2026-12-11" })
  @IsOptional()
  @IsDateString()
  weddingDate?: string | null;

  @OptionalText(120) venue?: string | null;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  services!: string[];

  @OptionalText(1000) message?: string | null;
  @OptionalText(200) sourcePage?: string | null;
  /** Honeypot. */
  @OptionalText(200) company?: string | null;
  @OptionalText(4096) turnstileToken?: string | null;
}

export class UpdateInquiryDto {
  @ApiPropertyOptional({ enum: InquiryStatus })
  @IsOptional()
  @IsEnum(InquiryStatus)
  status?: InquiryStatus;
  @OptionalText(5000) notes?: string | null;
}

export class ListInquiriesQuery {
  @ApiPropertyOptional({ enum: InquiryStatus })
  @IsOptional()
  @IsEnum(InquiryStatus)
  status?: InquiryStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) q?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 25;
}
