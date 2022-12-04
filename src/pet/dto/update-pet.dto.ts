import { PET_STATUS } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsPositive,
  IsIn,
  IsOptional,
  IsEnum,
  IsBase64,
} from 'class-validator';
export class UpdatePetDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  breed: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  condition: number;

  @IsOptional()
  @IsNotEmpty({ message: 'animal_history is required' })
  @IsString({ message: 'animal_history must be a string' })
  animal_history: string;

  @IsOptional()
  @IsNotEmpty({ message: 'medical_history is required' })
  @IsString({ message: 'medical_history must be a string' })
  medical_history: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  type: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  age: number;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  gender: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  traits: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  healthNotes: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  imageUrl: string;

  // @IsIn(['READY', 'PENDING', 'ADOPTED'], {
  //   message: 'Status must be READY, PENDING or ADOPTED',
  // })
  @IsEnum(PET_STATUS, { message: 'Status must be READY, PENDING or ADOPTED' })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  status: string;
}
