import { Match } from './match.decorator';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class AuthRegisterDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({ message: 'Email is not valid' })
  email: string;
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string;

  @IsNotEmpty({ message: 'Password confirmation is required' })
  @IsString({ message: 'Password confirmation must be a string' })
  @Match('password', { message: 'Passwords do not match' }) // this is a custom decorator to match password and password confirmation. It is defined in match.decorator.ts. Compare password is still not built in class-validator
  password_confirmation: string;
}
