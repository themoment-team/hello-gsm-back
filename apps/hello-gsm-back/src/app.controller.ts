import { Controller, Get, HttpCode } from '@nestjs/common';
import { Public } from 'apps/hello-gsm-back/src/auth/decorators/public.decorator';

@Controller('')
export class AppController {
  @Public()
  @Get('/health')
  @HttpCode(200)
  health() {
    return 'hellogsm server is live';
  }
}
