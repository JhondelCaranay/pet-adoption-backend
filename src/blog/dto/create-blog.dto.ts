import { PATH } from '@prisma/client';
import { IsString, IsNotEmpty, IsEnum, IsArray } from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsArray()
  photos: string[];

  @IsEnum(PATH, { message: 'path must be HOME, ABOUT or GALLERY' })
  @IsNotEmpty()
  @IsString()
  path: string;
}
