import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class PasswordResetDto {
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  new_password: string;

  @IsNotEmpty({ message: 'Reset Token is required' })
  @IsString({ message: 'Reset Token must be a string' })
  password_reset_token: string;
}
