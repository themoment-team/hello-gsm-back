import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirstSubmission } from './dto';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('application')
export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  @Post('/firstSubmission')
  @UseInterceptors(FileInterceptor('photo'))
  async firstSubmission(
    @User('user_idx') user_idx: number,
    @Body() data: FirstSubmission,
  ) {
    await this.applicationService.firstSubmission(user_idx, data);
  }
}
