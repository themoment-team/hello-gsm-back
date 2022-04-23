import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { verifyDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/verify')
  verify(@Body() data: verifyDto) {
    return this.authService.verify(data);
  }

  @Post('/emailConfirm')
  emailConfirm() {
    return;
  }

  @Post('/signup')
  signup() {
    return;
  }

  @Post('signin')
  signin() {
    return;
  }

  @Post('refresh')
  refresh() {
    return;
  }
}
