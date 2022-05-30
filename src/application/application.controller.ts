import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirstSubmission, SecondsSubmissionDto } from './dto';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('application')
export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  @Post('/firstSubmission')
  @UseInterceptors(FileInterceptor('photo'))
  async firstSubmission(
    @UploadedFile() photo: Express.Multer.File,
    @User('user_idx') user_idx: number,
    @Body() data: FirstSubmission,
  ) {
    if (!photo) throw new BadRequestException('Not Found file');

    const ID_photo_url = await this.applicationService.s3_upload(photo);
    await this.applicationService.firstSubmission(user_idx, data, ID_photo_url);
  }

  @Post('/secondsSubmission')
  async secondsSubmission(
    @Body() data: SecondsSubmissionDto,
    @User('user_idx') user_idx: number,
  ) {
    return this.applicationService.secondsSubmission(data, user_idx);
  }
}
