import { Type } from 'class-transformer';
import { ValidateNested, IsObject, IsNotEmptyObject } from 'class-validator';
import { ApplicationDetailDto } from './application.dtail.dto';
import { ApplicationDto } from './application.dto';

export class FirstSubmissionDto {
  @Type(() => ApplicationDto)
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  application: ApplicationDto;

  @Type(() => ApplicationDetailDto)
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  applicationDetail: ApplicationDetailDto;
}
