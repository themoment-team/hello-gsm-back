import {
  IsEnum,
  IsPhoneNumber,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { EducationStatus, Major, Screening } from 'src/types';

export class FirstSubmissionDto {
  @IsPhoneNumber('KR')
  @IsString()
  @MaxLength(20)
  guardianCellphoneNumber: string;

  @IsString()
  @IsPhoneNumber('KR')
  @MaxLength(20)
  @IsOptional()
  teacherCellphoneNumber: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  schoolName: string;

  @IsString()
  @IsEnum(Screening)
  screening: Screening;

  @MaxLength(50)
  @IsString()
  address: string;

  @MaxLength(50)
  @IsString()
  @IsOptional()
  addressDetails?: string;

  @IsPhoneNumber('KR')
  @IsString()
  @MaxLength(20)
  @IsOptional()
  telephoneNumber?: string;

  @IsString()
  @MaxLength(20)
  guardianName: string;

  @IsString()
  @MaxLength(20)
  guardianRelation: string;

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

  @IsString()
  @MaxLength(4)
  graduationYear: string;

  @IsString()
  @MaxLength(2)
  graduationMonth: string;

  @IsString()
  @IsPhoneNumber('KR')
  @MaxLength(20)
  @IsOptional()
  schoolTelephoneNumber?: string;

  @IsEnum(Major)
  firstWantedMajor: Major;

  @IsEnum(Major)
  secondWantedMajor: Major;

  @IsEnum(Major)
  thirdWantedMajor: Major;
}
