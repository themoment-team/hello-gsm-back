import { IsNotEmpty, IsNumber } from 'class-validator';

export class DocumentDto {
  @IsNumber()
  @IsNotEmpty()
  registrationNumber: number;
}
