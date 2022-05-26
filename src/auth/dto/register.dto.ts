import { IsDateString, IsEnum, IsPhoneNumber, IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsPhoneNumber('KR')
  cellphoneNumber: string;

  @IsDateString()
  birth: Date;

  @IsEnum(['M', 'F'])
  gender: 'M' | 'F';
}
