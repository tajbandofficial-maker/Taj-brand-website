import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsObject, IsOptional, Matches } from "class-validator";

import { OptionalId, OptionalText } from "../../common/dto/validators.js";

/** Every field optional: PATCH sends only what changed. Field keys are checked in the service. */
export class UpdatePageDto {
  @ApiPropertyOptional({
    type: "object",
    additionalProperties: { type: "string" },
    example: { heroTitle: "The baraat Delhi" },
  })
  @IsOptional()
  @IsObject()
  fields?: Record<string, string>;

  @OptionalId() heroImageId?: string | null;

  @ApiPropertyOptional({ nullable: true, example: "0M1dGLrOgkg" })
  @IsOptional()
  @Matches(/^[A-Za-z0-9_-]{11}$/, { message: "youtubeId must be an 11-character YouTube id" })
  youtubeId?: string | null;

  @OptionalText(70) seoTitle?: string | null;
  @OptionalText(170) seoDescription?: string | null;
  @OptionalId() ogImageId?: string | null;
}
