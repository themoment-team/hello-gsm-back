import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SigninDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @MaxLength(30)
  @MinLength(8)
  password: string;
}
