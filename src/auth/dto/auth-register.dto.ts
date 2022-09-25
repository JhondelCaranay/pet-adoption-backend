import { Match } from './match.decorator';
import { IsString, IsNotEmpty, IsEmail, IsNumber, IsNumberString } from 'class-validator';

export class AuthRegisterDto {
  @IsNotEmpty({ message: 'Firstname is required' })
  @IsString({ message: 'Firstname must be a string' })
  first_name: string;
  @IsNotEmpty({ message: 'Lastname is required' })
  @IsString({ message: 'Lastname must be a string' })
  last_name: string;
  @IsNotEmpty({ message: 'Contact is required' })
  @IsString({ message: 'Contact must be a string' })
  @IsNumberString('Contact must be a number')
  contact: string;
  @IsNotEmpty({ message: 'Address is required' })
  @IsString({ message: 'Address must be a string' })
  address: string;
  @IsNotEmpty({ message: 'Gender is required' })
  @IsString({ message: 'Gender must be a string' })
  gender: string;
  @IsNotEmpty({ message: 'Age is required' })
  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false,
      maxDecimalPlaces: 0,
    },
    { message: 'Age must be a number' },
  )
  age: number;
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
