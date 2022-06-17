import { Optional } from '@nestjs/common';
import { IsEnum, IsPhoneNumber, IsString, MaxLength } from 'class-validator';
import { EducationStatus } from 'apps/client/src/types';
import { ApplicationDetailSuperDto } from './application.detail.super';

export class ApplicationDetailDto extends ApplicationDetailSuperDto {
  @IsString()
  @MaxLength(20)
  @Optional()
  teacherName: string;

  @IsString()
  @MaxLength(50)
  @Optional()
  schoolLocation: string;

  @IsString()
  @IsEnum(EducationStatus)
  educationStatus: EducationStatus;

  @IsString()
  @IsPhoneNumber('KR')
  @MaxLength(20)
  @Optional()
  schoolTelephoneNumber: string;
}
