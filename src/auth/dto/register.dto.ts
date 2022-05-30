import {
  IsEnum,
  IsPhoneNumber,
  IsString,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MaxLength(20)
  name: string;

  @MaxLength(20)
  @IsPhoneNumber('KR')
  cellphoneNumber: string;

  @IsDateString()
  birth: string;

  @IsEnum(['남', '여'])
  gender: '남' | '여';
}
