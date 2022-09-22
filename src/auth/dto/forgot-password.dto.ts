// import { Expose, Exclude } from 'class-transformer';
import { IsString, IsNotEmpty, IsEmail, IsIn } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @IsNotEmpty({ message: 'Type is required' })
  @IsString({ message: 'Type must be a string' })
  @IsIn(['email', 'phone'], {
    message: 'Type is not valid. Please select email or phone',
  })
  type: string;
}
