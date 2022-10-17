import { PetService } from './pet.service';
import { CreatePetDto, UpdatePetDto } from './dto';
import { Public, Roles } from './../common/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Pet } from './types';
@Controller('pets')
export class PetController {
  constructor(private petService: PetService) {}

  @Public()
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  getPetStats() {
    return this.petService.getPetStats();
  }

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  createPet(@Body() dto: CreatePetDto): Promise<Pet> {
    return this.petService.createPet(dto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  getPets(
    @Query('filter', ParseBoolPipe) exclude: boolean,
    @Query('search') search: string,
  ): Promise<Pet[]> {
    return this.petService.getPets(exclude, search);
  }

  // get pet by id
  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getPetById(@Param('id', ParseIntPipe) id: number): Promise<Pet> {
    return this.petService.getPetById(id);
  }

  // update pet by id
  @Roles('ADMIN')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  updatePet(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePetDto,
  ): Promise<Pet> {
    return this.petService.updatePet(id, dto);
  }

  // delete pet by id
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  deletePet(@Param('id', ParseIntPipe) id: number): Promise<Pet> {
    return this.petService.deletePet(id);
  }
}
