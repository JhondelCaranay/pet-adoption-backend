// import { ADOPTION_STATUS } from '@prisma/client';
import {
  IsString,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateAdoptionDto {
  @IsDateString()
  @IsNotEmpty()
  schedule: Date;

  @IsNotEmpty()
  @IsNumber()
  adopterId: number;

  @IsNotEmpty()
  @IsNumber()
  adopteeId: number;
}
