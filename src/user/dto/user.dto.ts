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

  @IsEnum(['남자', '여자'])
  @MaxLength(20)
  gender: '남자' | '여자';

  @IsPhoneNumber('KR')
  @MaxLength(20)
  cellphoneNumber: string;
}
