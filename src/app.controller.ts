import { Controller, Get, HttpCode } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('')
export class AppController {
  @Public()
  @Get('/health')
  @HttpCode(200)
  health() {
    return 'hellogsm server is live';
  }
}
