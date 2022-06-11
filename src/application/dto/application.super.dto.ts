import { IsEnum, IsPhoneNumber, IsString, MaxLength } from 'class-validator';
import { Screening } from 'src/types';

export class ApplicationSuperDto {
  @IsPhoneNumber('KR')
  @IsString()
  @MaxLength(20)
  guardianCellphoneNumber: string;

  @IsString()
  @IsEnum(Screening)
  screening: Screening;
}
