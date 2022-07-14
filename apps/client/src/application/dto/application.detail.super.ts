import {
  IsEnum,
  IsPhoneNumber,
  IsString,
  MaxLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Major } from 'apps/client/src/types';

export class ApplicationDetailSuperDto {
  @MaxLength(50)
  @IsString()
  address: string;

  @MaxLength(50)
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  addressDetails: string | 'null';

  @IsPhoneNumber('KR')
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(20)
  telephoneNumber: string | 'null';

  @IsString()
  @MaxLength(20)
  guardianName: string;

  @IsString()
  @MaxLength(20)
  guardianRelation: string;

  @IsString()
  @MaxLength(4)
  graduationYear: string;

  @IsString()
  @MaxLength(2)
  graduationMonth: string;

  @IsEnum(Major)
  firstWantedMajor: Major;

  @IsEnum(Major)
  secondWantedMajor: Major;

  @IsEnum(Major)
  thirdWantedMajor: Major;
}
