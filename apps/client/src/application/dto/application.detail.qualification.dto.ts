import { IsEnum } from 'class-validator';
import { EducationStatus } from 'apps/client/src/types';
import { ApplicationDetailSuperDto } from './application.detail.super';

export class ApplicationDetailQualificationDto extends ApplicationDetailSuperDto {
  @IsEnum(['null'])
  teacherName: 'null';

  @IsEnum(['null'])
  schoolLocation: 'null';

  @IsEnum([EducationStatus.검정고시])
  educationStatus: EducationStatus.검정고시;
}
