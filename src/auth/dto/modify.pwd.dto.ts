import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class ModifyPwdDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  code: string;

  @IsString()
  @MinLength(8)
  @MaxLength(30)
  password: string;

  @IsString()
  @MinLength(8)
  @MaxLength(30)
  passwordConfirm: string;
}
