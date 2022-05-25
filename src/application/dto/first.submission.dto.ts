import {
  IsDateString,
  IsEnum,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class FirstSubmission {
  user: UserDto;
  application: ApplicationDto;
}

class UserDto {
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
  cellphone_number: string;
}

class ApplicationDto {
  @MaxLength(50)
  @IsString()
  address: string;

  @MaxLength(50)
  @IsString()
  address_details: string;

  @IsString()
  @MaxLength(20)
  guardian_name: string;

  @IsPhoneNumber('KR')
  @IsString()
  @MaxLength(20)
  guardian_cellphone_number: string;

  @IsString()
  @MaxLength(20)
  teacher_name: string;

  @IsString()
  @IsPhoneNumber('KR')
  @MaxLength(20)
  teacher_cellphone_number: string;

  @IsString()
  @MaxLength(50)
  school_location: string;

  @IsString()
  @MaxLength(50)
  school_name: string;

  @IsString()
  @IsEnum(['일반전형', '사회통합전형', '특별전형'])
  screening: '일반전형' | '사회통합전형' | '특별전형'; // 전형 나중에 enum으로

  @IsString()
  social_screening: string; // 사회전형대상구분 이것도 나중에 enum으로

  @IsPhoneNumber('KR')
  @IsString()
  @MaxLength(20)
  telephone_number: string;

  @IsEnum(['인공지능과', '스마트IOT과', '소프트웨어개발과'])
  first_wanted_major: '인공지능과' | '스마트IOT과' | '소프트웨어개발과';

  @IsEnum(['인공지능과', '스마트IOT과', '소프트웨어개발과'])
  second_wanted_major: '인공지능과' | '스마트IOT과' | '소프트웨어개발과';

  @IsEnum(['인공지능과', '스마트IOT과', '소프트웨어개발과'])
  third_wanted_major: '인공지능과' | '스마트IOT과' | '소프트웨어개발과';

  @IsString()
  @MaxLength(4)
  graduation_year: string;

  @IsString()
  @MaxLength(2)
  graduation_month: string;

  @IsString()
  @IsEnum(['졸업예정', '졸업', '검정고시'])
  education_status: '졸업예정' | '졸업' | '검정고시';

  @IsString()
  @MaxLength(20)
  guardian_relation: string;

  @IsString()
  @IsPhoneNumber('KR')
  @MaxLength(20)
  school_telephone_number: string;
}
