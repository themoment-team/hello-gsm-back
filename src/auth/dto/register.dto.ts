import { IsEnum, IsPhoneNumber, IsString, IsDateString } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsPhoneNumber('KR')
  cellphone_number: string;

  @IsDateString()
  birth: string;

  @IsEnum(['남', '여'])
  gender: '남' | '여';
}
