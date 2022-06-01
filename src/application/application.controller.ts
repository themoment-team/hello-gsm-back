import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Patch,
  Get,
  Delete,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirstSubmissionDto, SecondsSubmissionDto } from './dto';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('application')
export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  @Get('/')
  async getAllUserInfo(@User('user_idx') user_idx: number) {
    return this.applicationService.getAllUserInfo(user_idx);
  }

  @Delete()
  async deleteApplication(@User('user_idx') user_idx: number) {
    return this.applicationService.deleteApplication(user_idx);
  }

  @Post('/firstSubmission')
  @UseInterceptors(FileInterceptor('photo'))
  async firstSubmission(
    @UploadedFile() photo: Express.Multer.File,
    @User('user_idx') user_idx: number,
    @Body() data: FirstSubmissionDto,
  ) {
    return this.applicationService.firstSubmission(user_idx, data, photo);
  }

  @Post('/secondsSubmission')
  async secondsSubmission(
    @Body() data: SecondsSubmissionDto,
    @User('user_idx') user_idx: number,
  ) {
    return this.applicationService.secondsSubmission(data, user_idx);
  }

  @Patch('/firstSubmission')
  @UseInterceptors(FileInterceptor('photo'))
  async firstSubmissionPatch(
    @UploadedFile() photo: Express.Multer.File,
    @User('user_idx') user_idx: number,
    @Body() data: FirstSubmissionDto,
  ) {
    return this.applicationService.firstSubmissionPatch(user_idx, data, photo);
  }

  @Patch('/secondsSubmission')
  async secondsSubmissionPatch(
    @Body() data: SecondsSubmissionDto,
    @User('user_idx') user_idx: number,
  ) {
    return this.applicationService.secondsSubmissionPatch(data, user_idx);
  }
}
