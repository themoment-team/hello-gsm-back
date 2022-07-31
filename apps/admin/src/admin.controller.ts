import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators';

@Controller()
export class AdminController {
  @Get()
  @Public()
  Main(): string {
    return 'Server is running';
  }
}
