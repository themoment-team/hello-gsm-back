import { Controller } from '@nestjs/common';
import { ApplicationService } from './application.service';

@Controller('application')
export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}
}
