import { PATH } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
} from 'class-validator';

export class UpdateBlogDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  title: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  content: string;

  @IsNotEmpty()
  @IsArray()
  @IsOptional()
  photos: string[];

  @IsEnum(PATH, { message: 'path must be HOME, ABOUT or GALLERY' })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  path: string;
}
