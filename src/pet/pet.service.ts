import { format } from 'date-fns';
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

  async getPetStats() {
    const stats = [
      {
        month: 0,
        total: 0,
      },
      {
        month: 1,
        total: 0,
      },
      {
        month: 2,
        total: 0,
      },
      {
        month: 3,
        total: 0,
      },
      {
        month: 4,
        total: 0,
      },
      {
        month: 5,
        total: 0,
      },
      {
        month: 6,
        total: 0,
      },
      {
        month: 7,
        total: 0,
      },
      {
        month: 8,
        total: 0,
      },
      {
        month: 9,
        total: 0,
      },
      {
        month: 10,
        total: 0,
      },
      {
        month: 11,
        total: 0,
      },
    ];
    const yearNow = new Date().getFullYear();

    const pets = await this.prisma.pet.findMany({
      select: {
        createdAt: true,
      },
    });

    pets.forEach((pet) => {
      const month = new Date(pet.createdAt).getMonth();
      const year = new Date(pet.createdAt).getFullYear();
      if (year === yearNow) {
        stats[month].total++;
      }
    });

    return stats;
  }

  async createPet(dto: CreatePetDto): Promise<Pet> {
    // upload image to cloudinary
    const { secure_url, public_id } = await uploadImage(dto.imageUrl);

    const pet = await this.prisma.pet.create({
      data: {
        name: dto.name,
        breed: dto.breed,
        condition: dto.condition || undefined,
        type: dto.type,
        status: (dto.status as PET_STATUS) || PET_STATUS.READY,
        age: dto.age,
        gender: dto.gender,
        traits: dto.traits,
        description: dto.description,
        healthNotes: dto.healthNotes,
        imageUrl: secure_url,
        imageId: public_id,
        animal_history: dto.animal_history,
        medical_history: dto.medical_history,
      },
    });

    let PetType = pet.type[0].toUpperCase();
    let PetId = pet.id < 10 ? `0${pet.id}` : pet.id;

    const formatString = `uuuuMMdd'${PetId}${PetType}'`;
    const formattedDate = format(pet.createdAt, formatString);

    await this.prisma.pet.update({
      where: {
        id: pet.id,
      },
      data: {
        animalId: formattedDate,
      },
    });

    pet.animalId = formattedDate;

    return pet;
  }

  async getPets(exclude: boolean, search: string = ''): Promise<Pet[]> {
    console.log('pet search');
    const pets = await this.prisma.pet.findMany({
      where: {
        status: {
          not: exclude ? PET_STATUS.ADOPTED : undefined,
        },
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            breed: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            type: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            gender: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            age: {
              equals: parseInt(search) ? parseInt(search) : undefined,
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

    // check if base64 image data:image
    if (dto.imageUrl.slice(0, 10) === 'data:image') {
      // delete old image
      await deleteImage(isPet.imageId);
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
        animal_history: dto.animal_history || undefined,
        medical_history: dto.medical_history || undefined,
      },
    });

    return pet;
  }

  async deletePet(id: number): Promise<Pet> {
    // check if pet exists
    const isPet = await this.getPetById(id);

    // delete image from cloudinary
    await deleteImage(isPet.imageId);

    const pet = await this.prisma.pet.delete({
      where: {
        id: Number(id),
      },
    });
    return pet;
  }
}
