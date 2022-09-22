// import { Expose, Exclude } from 'class-transformer';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class EmailDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;
}
