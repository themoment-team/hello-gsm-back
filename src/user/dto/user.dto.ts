import {
  IsDateString,
  IsEnum,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class UserDto {
  @IsString()
  @MaxLength(20)
  name: string;

  @IsString()
  @IsDateString()
  birth: string;

  @IsEnum(['남', '여'])
  @MaxLength(20)
  gender: '남' | '여';

  @IsPhoneNumber('KR')
  @MaxLength(20)
  cellphoneNumber: string;
}
