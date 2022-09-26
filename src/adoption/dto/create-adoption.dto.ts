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
  @IsDateString({ message: 'Schedule must be a date' })
  @IsNotEmpty({ message: 'Schedule is required' })
  schedule: Date;
  // @IsEnum(ADOPTION_STATUS, {
  //   message: 'Status must be PENDING, APPROVED or REJECTED',
  // })
  // @IsNotEmpty({ message: 'status is required' })
  // @IsString({ message: 'status must be a string' })
  // status: string;
  @IsNotEmpty({ message: 'adopterId is required' })
  @IsNumber({}, { message: 'adopterId must be a number' })
  adopterId: number;
  @IsNotEmpty({ message: 'adopteeId is required' })
  @IsNumber({}, { message: 'adopteeId must be a number' })
  adopteeId: number;
}
