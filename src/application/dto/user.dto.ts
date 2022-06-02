import {
  MaxLength,
  IsString,
  IsDateString,
  IsPhoneNumber,
  IsEnum,
} from 'class-validator';

export class UserDto {
  @MaxLength(20)
  @IsString()
  name: string;

  @IsEnum(['남', '여'])
  gender: '남' | '여';

  @IsDateString()
  birth: Date;

  @IsString()
  @IsPhoneNumber('KR')
  @MaxLength(20)
  cellphoneNumber: string;
}
