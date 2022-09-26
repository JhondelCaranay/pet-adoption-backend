import { PET_STATUS } from '@prisma/client';
import { CreatePetDto, UpdatePetDto } from './dto';
import { PrismaService } from './../prisma/prisma.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pet } from './types';

@Injectable()
export class PetService {
  constructor(private prisma: PrismaService) {}

  async createPet(dto: CreatePetDto): Promise<Pet> {
    const pet = await this.prisma.pet.create({
      data: {
        name: dto.name,
        breed: dto.breed,
        condition: dto.condition,
        type: dto.type,
        status: dto.status as PET_STATUS,
        age: dto.age,
        gender: dto.gender,
        traits: dto.traits,
        description: dto.description,
        imageUrl: dto.imageUrl,
      },
    });
    return pet;
  }

  async getPets(): Promise<Pet[]> {
    const pets = await this.prisma.pet.findMany();
    return pets;
  }

  async getPetById(id: number): Promise<Pet> {
    const pet = await this.prisma.pet.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!pet) {
      throw new NotFoundException(`Pet with id ${id} not found`);
    }

    return pet;
  }

  async updatePet(id: number, dto: UpdatePetDto): Promise<Pet> {
    // check if pet exists
    const isPet = await this.getPetById(id);

    const pet = await this.prisma.pet.update({
      where: {
        id: Number(id),
      },
      data: {
        name: dto.name || undefined,
        breed: dto.breed || undefined,
        condition: dto.condition || undefined,
        type: dto.type || undefined,
        status: (dto.status as PET_STATUS) || undefined,
        age: dto.age || undefined,
        gender: dto.gender || undefined,
        traits: dto.traits || undefined,
        description: dto.description || undefined,
        imageUrl: dto.imageUrl || undefined,
      },
    });

    return pet;
  }

  async deletePet(id: number): Promise<Pet> {
    // check if pet exists
    const isPet = await this.getPetById(id);

    const pet = await this.prisma.pet.delete({
      where: {
        id: Number(id),
      },
    });
    return pet;
  }
}
