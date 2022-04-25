import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { User } from './decorators/user.decorator';
import { emailConfirmDto, SigninDto, SignupDto, verifyDto } from './dto';
import { RtGuard } from './guards/rt.guard';

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
  async signin(@Body() data: SigninDto, @Res() res: Response) {
    const tokens = await this.authService.signin(data);

    res.cookie('accessToken', tokens.at, {
      httpOnly: true,
      expires: tokens.atExpired,
    });
    res.cookie('refreshToken', tokens.rt, {
      httpOnly: true,
      expires: tokens.rtExpired,
    });
    res.send('로그인 성공');
  }

  @Post('logout')
  async logout(@Res() res: Response, @User('email') email: string) {
    await this.authService.logout(email);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.send('로그아웃 완료');
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  async refresh(@User('email') email: string, @Res() res: Response) {
    const tokens = await this.authService.refresh(email);
    res.cookie('accessToken', tokens.at, {
      httpOnly: true,
      expires: tokens.atExpired,
    });
    res.cookie('refreshToken', tokens.rt, {
      httpOnly: true,
      expires: tokens.rtExpired,
    });
    res.send('성공');
  }
}
