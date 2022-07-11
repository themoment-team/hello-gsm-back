import { Controller, Get, Query } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { GetAllApplicationQuery } from './dto';

@Controller('application')
export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  @Get('/')
  async GetAllApplication(@Query() query: GetAllApplicationQuery) {
    return this.applicationService.GetAllApplication(query);
  }
}
