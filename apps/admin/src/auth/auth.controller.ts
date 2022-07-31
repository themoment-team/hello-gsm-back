import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { accessToken, refreshToken } from 'apps/admin/src/utils/token.name';
import { ConfigService } from '@nestjs/config';
import { ENV } from 'apps/admin/src/lib/env';
import { Public } from 'apps/admin/src/auth/decorators';
import { User } from './decorators';
import { UserDecoratorType } from './type';
import { RtGuard } from './guards';
import { TokensType } from './type/tokens.type';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  private cookieOption = {
    httpOnly: true,
    domain: this.configService.get(ENV.ADMIN_DOMAIN),
    secure: process.env.NODE_ENV === 'prod',
  };

  @Public()
  @Post('/login')
  async login(@Body() data: LoginDto, @Res() res: Response) {
    const tokens = await this.authService.login(data);

    this.ResCookie(res, tokens);
    res.send('로그인에 성공했습니다');
  }

  @Post('/logout')
  async logout(@User() data: UserDecoratorType, @Res() res: Response) {
    this.authService.logout(data);

    res.clearCookie(accessToken, {
      ...this.cookieOption,
    });
    res.clearCookie(refreshToken, {
      ...this.cookieOption,
    });
    res.send('로그아웃에 성공하였습니다');
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  async refresh(@User('user_idx') user_idx: number, @Res() res: Response) {
    const tokens = await this.authService.refresh(user_idx);
    this.ResCookie(res, tokens);
    res.send('토큰 재발급에 성공하였습니다.');
  }

  private ResCookie(res: Response, tokens: TokensType) {
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
