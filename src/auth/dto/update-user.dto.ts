import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  fist_name: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  last_name: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  contact: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  address: string;
}
