import { FeedbackService } from './feedback.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Feedback } from '@prisma/client';
import { CreateFeedbackDto, UpdateFeedbackDto } from './dto';
import { GetCurrentUserID, Public, Roles } from 'src/common/decorators';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createFeedback(
    @GetCurrentUserID() userId: number,
    @Body() dto: CreateFeedbackDto,
  ): Promise<Feedback | any> {
    return this.feedbackService.createFeedback(dto, userId);
  }

  @Roles('ADMIN')
  @Patch(':id')
  updateFeedback(@Param('id') id: number): Promise<Feedback | any> {
    return this.feedbackService.updateFeedback(id);
  }

  @Public()
  @Get('')
  getAllFeedbacks(): Promise<Feedback[] | any> {
    return this.feedbackService.getAllFeedbacks();
  }

  @Public()
  @Get('pinned')
  getAllPinnedFeedbacks(): Promise<Feedback[] | any> {
    return this.feedbackService.getAllPinnedFeedbacks();
  }
}
