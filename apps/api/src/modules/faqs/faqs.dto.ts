import { PartialType } from "@nestjs/swagger";

import { Flag, OptionalId, RequiredText } from "../../common/dto/validators.js";

export class CreateFaqDto {
  @RequiredText(200) question!: string;
  @RequiredText(2000) answer!: string;
  /** null = global FAQ */
  @OptionalId() serviceId?: string | null;
  @Flag() published?: boolean;
}
export class UpdateFaqDto extends PartialType(CreateFaqDto) {}
