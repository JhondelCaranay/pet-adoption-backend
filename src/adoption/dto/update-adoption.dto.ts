import { ADOPTION_STATUS } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class UpdateAdoptionDto {
  @IsOptional()
  @IsDateString({ message: 'Schedule must be a date' })
  @IsNotEmpty({ message: 'Schedule is required' })
  schedule: Date;

  @IsOptional()
  @IsEnum(ADOPTION_STATUS, {
    message: 'Status must be PENDING, APPROVED or REJECTED',
  })
  @IsNotEmpty({ message: 'status is required' })
  @IsString({ message: 'status must be a string' })
  status: string;

  @IsOptional()
  @IsNotEmpty({ message: 'adopterId is required' })
  @IsNumber({}, { message: 'adopterId must be a number' })
  adopterId: number;

  @IsOptional()
  @IsNotEmpty({ message: 'adopteeId is required' })
  @IsNumber({}, { message: 'adopteeId must be a number' })
  adopteeId: number;
}
