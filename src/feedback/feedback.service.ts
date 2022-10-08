import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Feedback } from '@prisma/client';
import { CreateFeedbackDto } from './dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async createFeedback(
    dto: CreateFeedbackDto,
    userId: number,
  ): Promise<Feedback | any> {
    const feedback = await this.prisma.feedback.create({
      data: {
        rate: dto.rate,
        message: dto.message,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return feedback;
  }

  async updateFeedback(id: number): Promise<Feedback | any> {
    // find feedback by id
    const feedback = await this.prisma.feedback.findUnique({
      where: {
        id,
      },
    });

    // if feedback not found
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    // update feedback

    const updatedFeedback = await this.prisma.feedback.update({
      where: {
        id: feedback.id,
      },
      data: {
        pin: !feedback.pin,
      },
    });
    return updatedFeedback;
  }

  async getAllFeedbacks(): Promise<Feedback[] | any> {
    const feedbacks = await this.prisma.feedback.findMany({});

    return feedbacks;
  }

  getAllPinnedFeedbacks(): Promise<Feedback[] | any> {
    return this.prisma.feedback.findMany({
      where: {
        pin: true,
      },
    });
  }
}
