import { IsEmail, IsString } from 'class-validator';

export class verifyDto {
  @IsEmail()
  @IsString()
  email: string;
}
