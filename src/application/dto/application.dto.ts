import {
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { Screening } from 'src/types';

export class ApplicationDto {
  @IsPhoneNumber('KR')
  @IsString()
  @MaxLength(20)
  guardianCellphoneNumber: string;

  @IsString()
  @IsPhoneNumber('KR')
  @MaxLength(20)
  teacherCellphoneNumber: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  schoolName: string;

  @IsString()
  @IsEnum(Screening)
  screening: Screening;
}
