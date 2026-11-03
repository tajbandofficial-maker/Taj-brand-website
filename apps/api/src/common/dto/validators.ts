import { applyDecorators } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

/** URL-safe lowercase slug, e.g. "brass-band-baraat". */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const Slug = () =>
  applyDecorators(
    ApiProperty({ example: "brass-band-baraat" }),
    IsString(),
    MaxLength(80),
    Matches(SLUG_REGEX, { message: "slug must be lowercase words separated by hyphens" }),
  );

export const RequiredText = (max = 200) =>
  applyDecorators(ApiProperty(), IsString(), MinLength(1), MaxLength(max));

/** Optional text; `null` clears the value. */
export const OptionalText = (max = 500) =>
  applyDecorators(
    ApiPropertyOptional({ nullable: true }),
    IsOptional(),
    IsString(),
    MaxLength(max),
  );

export const OptionalId = () =>
  applyDecorators(ApiPropertyOptional({ nullable: true }), IsOptional(), IsString(), MaxLength(40));

export const StringList = (maxItems = 30, maxLen = 200) =>
  applyDecorators(
    ApiProperty({ type: [String] }),
    IsArray(),
    ArrayMaxSize(maxItems),
    IsString({ each: true }),
    MaxLength(maxLen, { each: true }),
  );

export const IdList = () =>
  applyDecorators(
    ApiPropertyOptional({ type: [String] }),
    IsOptional(),
    IsArray(),
    ArrayMaxSize(100),
    IsString({ each: true }),
  );

export const Flag = () => applyDecorators(ApiPropertyOptional(), IsOptional(), IsBoolean());

/** Optional absolute http(s) URL; `null` clears it. */
export const OptionalUrl = () =>
  applyDecorators(
    ApiPropertyOptional({ nullable: true }),
    IsOptional(),
    IsUrl({ require_protocol: true, protocols: ["http", "https"] }),
    MaxLength(500),
  );

/** Optional non-negative whole number (counts, years); `null` hides it on the site. */
export const OptionalCount = () =>
  applyDecorators(
    ApiPropertyOptional({ nullable: true }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(0),
    Max(10_000_000),
  );

/** Optional non-negative whole rupees; `null` = "Price on request". */
export const OptionalPrice = () =>
  applyDecorators(
    ApiPropertyOptional({ nullable: true }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(0),
    Max(100_000_000),
  );
