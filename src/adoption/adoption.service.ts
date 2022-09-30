import { PetService } from './../pet/pet.service';
import { PrismaService } from './../prisma/prisma.service';
import { CreateAdoptionDto, UpdateAdoptionDto } from './dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ADOPTION_STATUS, PET_STATUS } from '@prisma/client';
@Injectable()
export class AdoptionService {
  constructor(private prisma: PrismaService, private petService: PetService) {}

  // create adoption
  async createAdoption(dto: CreateAdoptionDto) {
    // check if pet exists
    const Pet = await this.petService.getPetById(dto.adopteeId);

    // check if pet is not READY for adoption
    if (Pet.status == PET_STATUS.ADOPTED) {
      throw new BadRequestException(
        `Pet with id ${dto.adopteeId} is already adopted`,
      );
    }

    // check if user exists
    const isUser = await this.prisma.user.findUnique({
      where: {
        id: Number(dto.adopterId),
      },
    });
    if (!isUser) {
      throw new NotFoundException(`User with id ${dto.adopterId} not found`);
    }

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

    // update pet status
    Pet.status = PET_STATUS.PENDING;
    await this.petService.updatePet(dto.adopteeId, Pet);
    adoption.adoptee.status = PET_STATUS.PENDING;
    return adoption;
  }

  async getAllAdoptions() {
    // get all adoptions
    const adoptions = await this.prisma.adoption.findMany({
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

    // // check if pet is aleady adopted
    // const isPetAlreadyAdopted = await this.petService.getPetById(
    //   isAdoptionExist.adoptee.id,
    // );

    // if (isPetAlreadyAdopted.status == PET_STATUS.ADOPTED) {
    //   throw new BadRequestException(
    //     `Pet with id ${isAdoptionExist.adoptee.id} has already been adopted`,
    //   );
    // }

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
      Pet.status = PET_STATUS.ADOPTED;
      await this.petService.updatePet(adoption.adoptee.id, Pet);
    }

    // update pet status if adoption is rejected
    if (adoption.status === ADOPTION_STATUS.REJECTED) {
      Pet.status = PET_STATUS.PENDING;
      await this.petService.updatePet(adoption.adoptee.id, Pet);
    }

    // update pet status if adoption is peding
    if (adoption.status === ADOPTION_STATUS.PENDING) {
      Pet.status = PET_STATUS.PENDING;
      await this.petService.updatePet(adoption.adoptee.id, Pet);
    }

    adoption.adoptee.status = Pet.status as PET_STATUS;

    return adoption;
  }
}
