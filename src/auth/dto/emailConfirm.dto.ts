import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class emailConfirmDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;
}
