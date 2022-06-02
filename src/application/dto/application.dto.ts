import {
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';

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
