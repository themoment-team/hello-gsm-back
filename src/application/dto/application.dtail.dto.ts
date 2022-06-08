import { IsEnum, IsPhoneNumber, IsString, MaxLength } from 'class-validator';

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
  @IsEnum(['졸업예정', '졸업', '검정고시'])
  educationStatus: '졸업예정' | '졸업' | '검정고시';

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

  @IsEnum(['인공지능과', '스마트IOT과', '소프트웨어개발과'])
  firstWantedMajor: '인공지능과' | '스마트IOT과' | '소프트웨어개발과';

  @IsEnum(['인공지능과', '스마트IOT과', '소프트웨어개발과'])
  secondWantedMajor: '인공지능과' | '스마트IOT과' | '소프트웨어개발과';

  @IsEnum(['인공지능과', '스마트IOT과', '소프트웨어개발과'])
  thirdWantedMajor: '인공지능과' | '스마트IOT과' | '소프트웨어개발과';
}
