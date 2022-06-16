import {
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApplicationSuperDto } from './application.super.dto';

export class ApplicationDto extends ApplicationSuperDto {
  @IsString()
  @IsPhoneNumber('KR')
  @IsOptional()
  @MaxLength(20)
  teacherCellphoneNumber: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  schoolName: string;
}
