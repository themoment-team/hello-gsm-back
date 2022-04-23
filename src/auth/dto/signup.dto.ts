import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  name: string;

  @IsIn(['M', 'W'])
  gender: 'M' | 'W';

  @IsString()
  @MinLength(8)
  @MaxLength(30)
  password: string;

  @IsString()
  @MinLength(8)
  @MaxLength(30)
  passwordConfirm: string;
}
