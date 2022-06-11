import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ApplicationDetailDto } from './application.dtail.dto';
import { ApplicationDto } from './application.dto';

export class FirstSubmissionDto {
  @Type(() => ApplicationDto)
  @ValidateNested()
  application: ApplicationDto;

  @Type(() => ApplicationDetailDto)
  @ValidateNested()
  applicationDetail: ApplicationDetailDto;
}
