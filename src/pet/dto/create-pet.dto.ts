import { PET_STATUS } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsPositive,
  IsIn,
  IsEnum,
  IsNumberString,
} from 'class-validator';
export class CreatePetDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Breed is required' })
  @IsString({ message: 'Breed must be a string' })
  breed: string;

  @IsNotEmpty({ message: 'condition is required' })
  @IsNumber({}, { message: 'condition must be a number' })
  @Min(1, { message: 'condition must be greater than 0' })
  @Max(10, { message: 'condition must be less than 10' })
  condition: number;

  @IsNotEmpty({ message: 'type is required' })
  @IsString({ message: 'type must be a string' })
  type: string;

  @IsNotEmpty({ message: 'age is required' })
  @IsNumber({}, { message: 'age must be a number' })
  @IsPositive({ message: 'age must be greater than 0' })
  age: number;

  @IsNotEmpty({ message: 'Gender is required' })
  @IsString({ message: 'Gender must be a string' })
  gender: string;

  @IsNotEmpty()
  @IsString()
  traits: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  healthNotes: string;

  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  // @IsIn(['READY', 'PENDING', 'ADOPTED'], {
  //   message: 'Status must be READY, PENDING or ADOPTED',
  // })
  @IsEnum(PET_STATUS, { message: 'Status must be READY, PENDING or ADOPTED' })
  @IsNotEmpty()
  @IsString()
  status: string;
}
