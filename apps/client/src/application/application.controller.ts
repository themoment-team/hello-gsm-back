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
import {
  FirstSubmissionDto,
  GraduationSubmissionDto,
  GedSubmissionDto,
  SecondSubmissionDto,
} from './dto';
import { User } from 'apps/client/src/auth/decorators/user.decorator';

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
  async firstSubmission(
    @User('user_idx') user_idx: number,
    @Body() data: FirstSubmissionDto,
  ) {
    return this.applicationService.firstSubmission(user_idx, data);
  }

  @Post('/gedSubmission')
  async GedSubmission(
    @Body() data: GedSubmissionDto,
    @User('user_idx') user_idx: number,
  ) {
    return this.applicationService.GedSubmission(data, user_idx);
  }

  @Post('/image')
  @UseInterceptors(FileInterceptor('photo'))
  async image(
    @UploadedFile() photo: Express.Multer.File,
    @User('user_idx') user_idx: number,
  ) {
    return this.applicationService.image(photo, user_idx);
  }

  @Post('/secondSubmission')
  async secondSubmission(
    @Body() data: SecondSubmissionDto,
    @User('user_idx') user_idx: number,
  ) {
    return this.applicationService.secondSubmission(data, user_idx);
  }

  @Post('/graduationSubmission')
  async graduationSubmission(
    @Body() data: GraduationSubmissionDto,
    @User('user_idx') user_idx: number,
  ) {
    return this.applicationService.graduationSubmission(data, user_idx);
  }

  @Patch('/firstSubmission')
  @UseInterceptors(FileInterceptor('photo'))
  async firstSubmissionPatch(
    @User('user_idx') user_idx: number,
    @Body() data: FirstSubmissionDto,
  ) {
    return this.applicationService.firstSubmissionPatch(user_idx, data);
  }

  @Patch('/secondsSubmission')
  async secondsSubmissionPatch(
    @Body() data: SecondSubmissionDto,
    @User('user_idx') user_idx: number,
  ) {
    return this.applicationService.secondSubmissionPatch(data, user_idx);
  }

  @Patch('/finalSubmission')
  async finalSubmission(@User('user_idx') user_idx: number) {
    return this.applicationService.finalSubmission(user_idx);
  }
}
