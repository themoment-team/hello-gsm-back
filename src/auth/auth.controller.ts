import { Body, Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { emailConfirmDto, SignupDto, verifyDto } from './dto';

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
    res.cookie('emailConfirm', token, { expires: expiredAt, httpOnly: true });
    res.send('인증 성공');
  }

  @Public()
  @Post('/signup')
  async signup(
    @Body() data: SignupDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.authService.signup(data, req.cookies['emailConfirm']);
    res.clearCookie('emailConfirm');
    Logger.log(`${data.name} 가입 성공`);
    res.send('가입 성공');
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
