import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { GetAllApplicationQuery, ScoreDto } from './dto';

@Controller('application')
export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  @Get('/')
  async GetAllApplication(@Query() query: GetAllApplicationQuery) {
    return this.applicationService.GetAllApplication(query);
  }

  @Patch('/score')
  async score(@Body() data: ScoreDto) {
    return this.applicationService.score(data);
  }
}
