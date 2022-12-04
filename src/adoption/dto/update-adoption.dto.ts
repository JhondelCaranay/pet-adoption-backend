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
  @IsDateString()
  @IsNotEmpty()
  schedule: Date;

  @IsOptional()
  @IsEnum(ADOPTION_STATUS, {
    message: 'Status must be PENDING, APPROVED,APPROVED_INTERVIEW  or REJECTED',
  })
  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  adopterId: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  adopteeId: number;
}
