import { Controller, Get } from '@nestjs/common';

@Controller()
export class AdminController {
  @Get()
  Main(): string {
    return 'Server is running';
  }
}
