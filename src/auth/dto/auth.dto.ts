import { IsString, IsNotEmpty, IsEmail, IsIn } from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
  @IsNotEmpty()
  @IsString()
  @IsIn(['USER', 'ADMIN'])
  role: string;
}
