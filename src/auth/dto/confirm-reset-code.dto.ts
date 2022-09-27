import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmResetCodeDto {
  @IsNotEmpty()
  @IsString()
  search: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}
