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
import { deleteImage, uploadImage } from 'src/common/utils/cloudenary.util';

@Injectable()
export class PetService {
  constructor(private prisma: PrismaService) {}

  async createPet(dto: CreatePetDto): Promise<Pet> {
    // upload image to cloudinary
    const { secure_url, public_id } = await uploadImage(dto.imageUrl);

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
        healthNotes: dto.healthNotes,
        imageUrl: secure_url,
        imageId: public_id,
      },
    });
    console.log(pet);
    return pet;
  }

  async getPets(exclude: boolean, search: string = ''): Promise<Pet[]> {
    const pets = await this.prisma.pet.findMany({
      where: {
        status: {
          not: exclude ? PET_STATUS.ADOPTED : undefined,
        },
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            breed: {
              contains: search,
            },
          },
          {
            type: {
              contains: search,
            },
          },
        ],
      },
    });
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
    // check if image is updated

    let imageUrl: string = '';
    let imageId: string = '';

    if (dto.imageUrl) {
      // delete old image
      deleteImage(isPet.imageId);
      // upload new image
      const res = await uploadImage(dto.imageUrl);
      imageUrl = res.secure_url;
      imageId = res.public_id;
    }

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
        healthNotes: dto.healthNotes || undefined,
        imageUrl: dto.imageUrl ? imageUrl : undefined,
        imageId: dto.imageUrl ? imageId : undefined,
      },
    });

    return pet;
  }

  async deletePet(id: number): Promise<Pet> {
    // check if pet exists
    const isPet = await this.getPetById(id);

    // delete image from cloudinary
    deleteImage(isPet.imageId);

    const pet = await this.prisma.pet.delete({
      where: {
        id: Number(id),
      },
    });
    return pet;
  }
}
