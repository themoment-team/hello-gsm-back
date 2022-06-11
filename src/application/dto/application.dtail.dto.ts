import { IsEnum, IsPhoneNumber, IsString, MaxLength } from 'class-validator';
import { EducationStatus, Major } from 'src/types';

export class ApplicationDetailDto {
  @MaxLength(500)
  @IsString()
  idPhotoUrl: string;

  @MaxLength(50)
  @IsString()
  address: string;

  @MaxLength(50)
  @IsString()
  addressDetails: string;

  @IsPhoneNumber('KR')
  @IsString()
  @MaxLength(20)
  telephoneNumber: string;

  @IsString()
  @MaxLength(20)
  guardianName: string;

  @IsString()
  @MaxLength(20)
  guardianRelation: string;

  @IsString()
  @MaxLength(20)
  teacherName: string;

  @IsString()
  @MaxLength(50)
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
  schoolTelephoneNumber: string;

  @IsEnum(Major)
  firstWantedMajor: Major;

  @IsEnum(Major)
  secondWantedMajor: Major;

  @IsEnum(Major)
  thirdWantedMajor: Major;
}
