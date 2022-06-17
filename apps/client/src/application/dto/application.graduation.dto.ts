import { IsPhoneNumber, IsString, MaxLength } from 'class-validator';
import { ApplicationSuperDto } from './application.super.dto';

export class ApplicationGraduationDto extends ApplicationSuperDto {
  @IsString()
  @IsPhoneNumber('KR')
  @MaxLength(20)
  teacherCellphoneNumber: string;

  @IsString()
  @MaxLength(50)
  schoolName: string;
}
