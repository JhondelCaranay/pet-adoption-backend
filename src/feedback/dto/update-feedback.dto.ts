import { IsString, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';
export class UpdateFeedbackDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsBoolean()
  pin: boolean;
}
