import { AdoptionService } from './adoption.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateAdoptionDto, UpdateAdoptionDto } from './dto';
import { Public, Roles } from 'src/common/decorators';

@Controller('adoption')
export class AdoptionController {
  constructor(private adoptionService: AdoptionService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createAdoption(@Body() dto: CreateAdoptionDto) {
    return this.adoptionService.createAdoption(dto);
  }

  @Get('')
  getAllAdoptions(@Query('search') search: string) {
    return this.adoptionService.getAllAdoptions(search);
  }

  @Public()
  @Get('stats')
  getAdoptionStats() {
    return this.adoptionService.getAdoptionStats();
  }

  @Get(':id')
  getAdoptionById(@Param('id', ParseIntPipe) id: number) {
    return this.adoptionService.getAdoptionById(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  updateAdoptionById(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdoptionDto,
  ) {
    return this.adoptionService.updateAdoptionById(id, dto);
  }
}
