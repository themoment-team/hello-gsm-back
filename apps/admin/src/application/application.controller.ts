import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { GetAllApplicationQuery, ScoreDto, DocumentDto } from './dto';

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

  @Get('/ticket')
  async ticket() {
    return this.applicationService.ticket();
  }

  @Patch('/document')
  async document(@Body() data: DocumentDto) {
    return this.applicationService.document(data);
  }

  @Get('/count')
  async count() {
    return { count: await this.applicationService.count() };
  }
}
