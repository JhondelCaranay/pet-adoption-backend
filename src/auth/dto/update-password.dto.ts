import { IsNotEmpty, IsString } from 'class-validator';
import { Match } from './match.decorator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;
  @IsNotEmpty()
  @IsString()
  @Match('password', {
    message: 'Password confirmation does not match password',
  }) // this is a custom decorator to match password and password confirmation. It is defined in match.decorator.ts. Compare password is still not built in class-validator
  password_confirmation: string;
}
