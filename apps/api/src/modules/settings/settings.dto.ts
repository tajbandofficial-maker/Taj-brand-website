import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

import {
  OptionalCount,
  OptionalId,
  OptionalText,
  OptionalUrl,
  StringList,
} from "../../common/dto/validators.js";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export class OpeningHoursDto {
  @ApiProperty({ type: [String], example: ["Monday", "Tuesday"] })
  @IsArray()
  @ArrayMaxSize(7)
  @IsString({ each: true })
  days!: string[];

  @ApiProperty({ example: "09:00" }) @Matches(TIME) opens!: string;
  @ApiProperty({ example: "22:00" }) @Matches(TIME) closes!: string;
}

export class SocialsDto {
  @ApiPropertyOptional() @IsOptional() @IsUrl() instagram?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() facebook?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() youtube?: string;
}

/** Every field optional: PATCH sends only what changed. */
export class UpdateSettingsDto {
  @OptionalText(80) businessName?: string;
  @OptionalText(80) tagline?: string;
  @OptionalText(30) phone?: string;
  @OptionalText(30) altPhone?: string | null;

  @ApiPropertyOptional({ example: "919876543210" })
  @IsOptional()
  @Matches(/^\d{10,15}$/, {
    message: "whatsapp must be digits only with country code, e.g. 919876543210",
  })
  whatsapp?: string;

  @OptionalText(120) email?: string | null;
  @OptionalText(200) addressLine?: string;
  @OptionalText(80) city?: string;
  @OptionalText(12) postalCode?: string | null;

  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsNumber() @Min(-90) @Max(90) geoLat?:
    number | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsNumber() @Min(-180) @Max(180) geoLng?:
    number | null;

  @ApiPropertyOptional({ type: [OpeningHoursDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursDto)
  hours?: OpeningHoursDto[];

  @OptionalUrl() mapEmbedUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  googleRating?: number | null;

  @OptionalCount() googleReviewCount?: number | null;
  @OptionalUrl() googleProfileUrl?: string | null;
  @OptionalCount() foundedYear?: number | null;
  @OptionalCount() weddingsPerformed?: number | null;
  @OptionalUrl() netflixUrl?: string | null;
  @OptionalText(300) netflixBlurb?: string | null;

  @ApiPropertyOptional({ example: "Taj Band — Wedding Band & Baraat, Delhi" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(70)
  seoSiteTitle?: string;

  @OptionalText(170) seoDescription?: string | null;
  @OptionalId() ogImageId?: string | null;

  @ApiPropertyOptional({ type: SocialsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialsDto)
  socials?: SocialsDto;

  @IsOptional() @StringList(20, 60) serviceAreas?: string[];
  @IsOptional() @StringList(20, 40) ticker?: string[];
  @OptionalText(300) whatsappDefaultMessage?: string;
}
