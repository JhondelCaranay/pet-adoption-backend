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
    const feedbacks = await this.prisma.feedback.findMany({
      select: {
        rate: true,
        message: true,
        id: true,
        pin: true,
        createdAt: true,
        user: {
          select: {
            role: true,
            email: true,
            id: true,
            createdAt: true,
            profile: true
          }
        }
      },
      orderBy: [
        {
          rate: 'desc'
        }
      ]
        
    });

    return feedbacks;
  }

  getAllPinnedFeedbacks(): Promise<Feedback[] | any> {
    return this.prisma.feedback.findMany({
      take: 3,
      where: {
        pin: true,
      },
      select: {
        rate: true,
        message: true,
        id: true,
        pin: true,
        createdAt: true,
        user: {
          select: {
            role: true,
            email: true,
            id: true,
            createdAt: true,
            profile: true
          }
        }
      },
      orderBy: [
        {
          rate: 'desc'
        }
      ],
    });
  }
  
  deleteFeedback(id: number): Promise<Feedback> {
    return this.prisma.feedback.delete({
      where: {
        id
      },
    });
  }
}
