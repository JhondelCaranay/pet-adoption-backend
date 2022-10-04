import { PetService } from './../pet/pet.service';
import { PrismaService } from './../prisma/prisma.service';
import { CreateAdoptionDto, UpdateAdoptionDto } from './dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ADOPTION_STATUS, PET_STATUS } from '@prisma/client';
import { sendSmsMessage } from 'src/common/utils/vonage.util';
import { format } from 'date-fns';
@Injectable()
export class AdoptionService {
  constructor(private prisma: PrismaService, private petService: PetService) {}

  // create adoption
  async createAdoption(dto: CreateAdoptionDto) {
    // check if pet
    console.log('DEBUG 1');
    const Pet = await this.petService.getPetById(dto.adopteeId);
    console.log('DEBUG 2');
    // check if pet is not READY for adoption
    if (Pet.status == PET_STATUS.ADOPTED) {
      throw new BadRequestException(
        `Pet with id ${dto.adopteeId} is already adopted`,
      );
    }
    console.log('DEBUG 3');
    // check if user exists
    const isUser = await this.prisma.user.findUnique({
      where: {
        id: Number(dto.adopterId),
      },
    });
    if (!isUser) {
      throw new NotFoundException(`User with id ${dto.adopterId} not found`);
    }
    console.log('DEBUG 4');
    // create adoption
    const adoption = await this.prisma.adoption.create({
      data: {
        schedule: dto.schedule,
        adopterId: dto.adopterId,
        adopteeId: dto.adopteeId,
      },
      select: {
        id: true,
        schedule: true,
        status: true,
        adopter: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                id: true,
                fist_name: true,
                last_name: true,
                contact: true,
                address: true,
              },
            },
          },
        },
        adoptee: {
          select: {
            id: true,
            name: true,
            breed: true,
            condition: true,
            type: true,
            status: true,
            age: true,
            gender: true,
            traits: true,
            description: true,
            imageUrl: true,
          },
        },
      },
    });
    console.log('DEBUG 5');
    // update pet status
    Pet.status = PET_STATUS.PENDING;
    console.log('DEBUG 6', { Pet });

    // await this.petService.updatePet(dto.adopteeId, Pet);
    await this.prisma.pet.update({
      where: {
        id: Number(dto.adopteeId),
      },
      data: {
        status: PET_STATUS.PENDING,
      },
    });
    adoption.adoptee.status = PET_STATUS.PENDING;
    return adoption;
  }

  async getAllAdoptions(search: string = 'ALL') {
    // get all adoptions

    const includes = Object.values(ADOPTION_STATUS);

    const isIncludes = includes.find((item) => item == search.toUpperCase());

    const adoptions = await this.prisma.adoption.findMany({
      where: {
        OR: [
          {
            status: {
              in: search === 'ALL' ? includes : [isIncludes],
            },
          },
          {
            adopter: {
              OR: [
                {
                  email: {
                    contains: search,
                  },
                },
                {
                  profile: {
                    OR: [
                      {
                        fist_name: {
                          contains: search,
                        },
                      },
                      {
                        last_name: {
                          contains: search,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      select: {
        id: true,
        schedule: true,
        status: true,
        adopter: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                id: true,
                fist_name: true,
                last_name: true,
                contact: true,
                address: true,
              },
            },
          },
        },
        adoptee: {
          select: {
            id: true,
            name: true,
            breed: true,
            condition: true,
            type: true,
            status: true,
            age: true,
            gender: true,
            traits: true,
            description: true,
            imageUrl: true,
          },
        },
      },
    });

    return adoptions;
  }

  async getAdoptionById(id: number) {
    // get adoption by id
    const adoption = await this.prisma.adoption.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        schedule: true,
        status: true,
        adopter: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                id: true,
                fist_name: true,
                last_name: true,
                contact: true,
                address: true,
              },
            },
          },
        },
        adoptee: {
          select: {
            id: true,
            name: true,
            breed: true,
            condition: true,
            type: true,
            status: true,
            age: true,
            gender: true,
            traits: true,
            description: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!adoption) {
      throw new NotFoundException(`Adoption with id ${id} not found`);
    }

    return adoption;
  }

  async updateAdoptionById(id: number, dto: UpdateAdoptionDto) {
    // check if adoption exists
    const isAdoptionExist = await this.getAdoptionById(id);

    // update adoption
    const adoption = await this.prisma.adoption.update({
      where: {
        id: Number(isAdoptionExist.id),
      },
      data: {
        status: (dto.status as ADOPTION_STATUS) || undefined,
        schedule: dto.schedule || undefined,
        adopterId: dto.adopterId || undefined,
        adopteeId: dto.adopteeId || undefined,
      },
      select: {
        id: true,
        schedule: true,
        status: true,
        adopter: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                id: true,
                fist_name: true,
                last_name: true,
                contact: true,
                address: true,
              },
            },
          },
        },
        adoptee: {
          select: {
            id: true,
            name: true,
            breed: true,
            condition: true,
            type: true,
            status: true,
            age: true,
            gender: true,
            traits: true,
            description: true,
            imageUrl: true,
          },
        },
      },
    });

    // get pet by id
    const Pet = await this.petService.getPetById(adoption.adoptee.id);

    // update pet status if adoption is approved
    if (adoption.status === ADOPTION_STATUS.APPROVED) {
      adoption.adoptee.status = PET_STATUS.ADOPTED;
      await this.prisma.pet.update({
        where: {
          id: Number(adoption.adoptee.id),
        },
        data: {
          status: PET_STATUS.ADOPTED,
        },
      });

      // date fns format 'dddd, mmmm dS, yyyy, h:MM:ss TT'
      const readableDate = format(new Date(adoption.schedule), 'PPpp');
      sendSmsMessage(
        adoption.adopter.profile.contact,
        'Your application for adoption has been approved. You are scheduled to meet the pet on ' +
          readableDate +
          '.',
      );
    }

    // update pet status if adoption is rejected
    if (adoption.status === ADOPTION_STATUS.REJECTED) {
      adoption.adoptee.status = PET_STATUS.PENDING;
      await this.prisma.pet.update({
        where: {
          id: Number(adoption.adoptee.id),
        },
        data: {
          status: PET_STATUS.PENDING,
        },
      });

      sendSmsMessage(
        adoption.adopter.profile.contact,
        'Your application for adoption has been rejected.',
      );
    }

    // update pet status if adoption is peding
    if (adoption.status === ADOPTION_STATUS.PENDING) {
      adoption.adoptee.status = PET_STATUS.PENDING;
      await this.prisma.pet.update({
        where: {
          id: Number(adoption.adoptee.id),
        },
        data: {
          status: PET_STATUS.PENDING,
        },
      });
    }

    return adoption;
  }
}
