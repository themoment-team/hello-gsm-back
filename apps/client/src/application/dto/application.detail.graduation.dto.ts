import { IsEnum, IsPhoneNumber, IsString, MaxLength } from 'class-validator';
import { EducationStatus } from 'apps/client/src/types';
import { ApplicationDetailSuperDto } from './application.detail.super';

export class ApplicationDetailGraduationDto extends ApplicationDetailSuperDto {
  @IsString()
  @MaxLength(20)
  teacherName: string;

  @IsString()
  @MaxLength(50)
  schoolLocation: string;

  @IsEnum([EducationStatus.졸업, EducationStatus.졸업예정])
  educationStatus: EducationStatus.졸업예정 | EducationStatus.졸업;
}
