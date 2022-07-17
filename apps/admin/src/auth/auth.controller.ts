import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { accessToken, refreshToken } from 'apps/client/src/utils/token.name';
import { ConfigService } from '@nestjs/config';
import { ENV } from 'apps/client/src/lib/env';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  private cookieOption = {
    httpOnly: true,
    domain: this.configService.get(ENV.DOMAIN),
    secure: process.env.NODE_ENV === 'prod',
  };

  @Post('/login')
  async login(@Body() data: LoginDto, @Res() res: Response) {
    const tokens = await this.authService.login(data);

    this.ResCookie(res, tokens);
    res.send('로그인에 성공했습니다');
  }

  private ResCookie(res: Response, tokens: any) {
    res.cookie(accessToken, tokens.at, {
      expires: tokens.atExpired,
      ...this.cookieOption,
    });
    res.cookie(refreshToken, tokens.rt, {
      expires: tokens.rtExpired,
      ...this.cookieOption,
    });
  }
}
