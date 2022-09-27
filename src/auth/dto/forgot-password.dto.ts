import { IsString, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsString()
  search: string;
}
// import { Expose, Exclude } from 'class-transformer';
// @IsNotEmpty({ message: 'Type is required' })
// @IsString({ message: 'Type must be a string' })
// @IsIn(['email', 'phone'], {
//   message: 'Type is not valid. Please select email or phone',
// })
// type: string;
