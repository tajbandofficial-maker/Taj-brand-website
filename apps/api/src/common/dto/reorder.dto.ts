import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, IsArray, IsString } from "class-validator";

/** Body for `PATCH /admin/<entity>/reorder`: ids in their new display order. */
export class ReorderDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(500)
  @IsString({ each: true })
  ids!: string[];
}
