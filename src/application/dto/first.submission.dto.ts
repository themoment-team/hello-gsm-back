import {
  IsDateString,
  IsEnum,
  IsPhoneNumber,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class UserDto {
  @MaxLength(20)
  @IsString()
  name: string;

  @IsEnum(['남', '여'])
  gender: '남' | '여';

  @IsDateString()
  birth: Date;

  @IsString()
  @IsPhoneNumber('KR')
  @MaxLength(20)
  cellphoneNumber: string;
}

export class ApplicationDto {
  @IsPhoneNumber('KR')
  @IsString()
  @MaxLength(20)
  guardianCellphoneNumber: string;

  @IsString()
  @IsPhoneNumber('KR')
  @MaxLength(20)
  teacherCellphoneNumber: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  schoolName: string;

  @IsString()
  @IsEnum(['일반전형', '사회통합전형', '특별전형'])
  screening: '일반전형' | '사회통합전형' | '특별전형';
}

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

export class FirstSubmissionDto {
  @MaxLength(20)
  @IsString()
  name: string;

  @IsEnum(['남', '여'])
  gender: '남' | '여';

  @IsDateString()
  birth: string;

  @IsString()
  @IsPhoneNumber('KR')
  @MaxLength(20)
  cellphoneNumber: string;

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
  @IsEnum(['일반전형', '사회통합전형', '특별전형'])
  screening: '일반전형' | '사회통합전형' | '특별전형';

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
  @IsOptional()
  schoolTelephoneNumber?: string;

  @IsEnum(['인공지능과', '스마트IOT과', '소프트웨어개발과'])
  firstWantedMajor: '인공지능과' | '스마트IOT과' | '소프트웨어개발과';

  @IsEnum(['인공지능과', '스마트IOT과', '소프트웨어개발과'])
  secondWantedMajor: '인공지능과' | '스마트IOT과' | '소프트웨어개발과';

  @IsEnum(['인공지능과', '스마트IOT과', '소프트웨어개발과'])
  thirdWantedMajor: '인공지능과' | '스마트IOT과' | '소프트웨어개발과';
}
