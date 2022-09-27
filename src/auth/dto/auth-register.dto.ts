import { Match } from './match.decorator';
import { IsString, IsNotEmpty, IsEmail, IsNumberString } from 'class-validator';

export class AuthRegisterDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;
  @IsNotEmpty()
  @IsString()
  last_name: string;
  @IsNotEmpty()
  @IsString()
  @IsNumberString()
  contact: string;
  @IsNotEmpty()
  @IsString()
  address: string;
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
  @IsNotEmpty()
  @IsString()
  @Match('password', {
    message: 'password confirmation does not match password',
  }) // this is a custom decorator to match password and password confirmation. It is defined in match.decorator.ts. Compare password is still not built in class-validator
  password_confirmation: string;
}

// @IsString({ message: 'Gender must be a string' })
// gender: string;
// @IsNotEmpty({ message: 'Age is required' })
// @IsNumber(
//   {
//     allowNaN: false,
//     allowInfinity: false,
//     maxDecimalPlaces: 0,
//   },
//   { message: 'Age must be a number' },
// )
// age: number;
