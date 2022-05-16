import { IsDate, IsEnum, IsPhoneNumber, IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsPhoneNumber('KR')
  cellphone_number: string;

  @IsDate()
  birth: Date;

  @IsEnum(['M', 'F'])
  gender: 'M' | 'F';
}
