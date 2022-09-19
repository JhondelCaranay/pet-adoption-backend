import { Expose, Exclude } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Equals,
  IsOptional,
  Validate,
} from 'class-validator';
import { Match } from './match.decorator';

export class AuthDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string;
}

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
  @Match('password', { message: 'Passwords do not match' })
  password_confirmation: string;
}
