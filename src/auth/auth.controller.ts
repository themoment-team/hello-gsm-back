import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { emailConfirmDto, verifyDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/verify')
  verify(@Body() data: verifyDto) {
    return this.authService.verify(data);
  }

  @Public()
  @Post('/emailconfirm')
  async emailConfirm(@Body() data: emailConfirmDto, @Res() res: Response) {
    const { expiredAt, token } = await this.authService.emailConfirm(data);
    res.cookie('emailConfirm', token, { expires: expiredAt });
    res.send('인증 성공');
  }

  @Public()
  @Post('/signup')
  signup() {
    return;
  }

  @Public()
  @Post('signin')
  signin() {
    return;
  }

  @Public()
  @Post('refresh')
  refresh() {
    return;
  }
}
