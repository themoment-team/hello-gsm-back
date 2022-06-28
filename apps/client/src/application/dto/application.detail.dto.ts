import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EducationStatus } from 'apps/client/src/types';
import { ApplicationDetailSuperDto } from './application.detail.super';

export class ApplicationDetailDto extends ApplicationDetailSuperDto {
  @IsString()
  @MaxLength(20)
  @IsOptional()
  teacherName: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  schoolLocation: string;

  @IsString()
  @IsEnum(EducationStatus)
  educationStatus: EducationStatus;
}
