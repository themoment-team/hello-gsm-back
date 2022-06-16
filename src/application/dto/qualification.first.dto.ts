import { IsEnum } from 'class-validator';
import { ApplicationSuperDto } from './application.super.dto';

export class QualificationFirstDto extends ApplicationSuperDto {
  @IsEnum(['null'])
  teacherCellphoneNumber: 'null';

  @IsEnum(['null'])
  schoolName: 'null';
}
