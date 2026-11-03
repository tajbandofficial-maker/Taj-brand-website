import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { AdminApi } from "../../common/admin.decorator.js";
import { ReorderDto } from "../../common/dto/reorder.dto.js";
import { CreateReviewDto, UpdateReviewDto } from "./reviews.dto.js";
import { ReviewsService } from "./reviews.service.js";

@AdminApi("reviews")
@Controller("admin/reviews")
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get() list() {
    return this.reviews.list();
  }
  @Patch("reorder") reorder(@Body() dto: ReorderDto) {
    return this.reviews.reorder(dto.ids);
  }
  @Get(":id") get(@Param("id") id: string) {
    return this.reviews.get(id);
  }
  @Post() create(@Body() dto: CreateReviewDto) {
    return this.reviews.create(dto);
  }
  @Patch(":id") update(@Param("id") id: string, @Body() dto: UpdateReviewDto) {
    return this.reviews.update(id, dto);
  }
  @Delete(":id") remove(@Param("id") id: string) {
    return this.reviews.remove(id);
  }
}
