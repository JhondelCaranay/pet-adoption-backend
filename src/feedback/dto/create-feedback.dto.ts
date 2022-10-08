import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
export class CreateFeedbackDto {
  @IsNotEmpty()
  @IsNumber()
  rate: number;

  @IsNotEmpty()
  @IsString()
  message: string;
}
