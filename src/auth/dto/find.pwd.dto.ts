import { IsString, MaxLength, MinLength } from 'class-validator';

export class FindPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  password: string;

  @IsString()
  @MinLength(8)
  @MaxLength(30)
  passwordConfirm: string;
}
