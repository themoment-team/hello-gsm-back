import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ENV } from 'apps/client/src/lib/env';
import { AtUser } from 'apps/client/src/types';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { User } from './decorators/user.decorator';
import { RegisterDto } from './dto/register.dto';
import { RtGuard } from './guards/rt.guard';
import {
  accessToken,
  refreshToken,
  registerToken,
} from 'apps/client/src/utils/token.name';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private cookieOption = {
    httpOnly: true,
    domain: this.configService.get(ENV.DOMAIN),
    secure: process.env.NODE_ENV === 'prod',
  };

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @ApiResponse({ status: 200, description: '성공' })
  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오로 로그인합니다.',
  })
  @UseGuards(AuthGuard('kakao'))
  @Public()
  @Get('/kakao')
  @HttpCode(201)
  async kakao() {}

  @Public()
  @UseGuards(AuthGuard('kakao'))
  @Get('/kakao/callback')
  @HttpCode(200)
  async kakaoLogin(@Req() req: Request, @Res() res: Response) {
    const user: any = req.user;
    const tokens: any = await this.authService.kakaoLogin(user._json);

    if (tokens.registerToken) {
      res.cookie(registerToken, tokens.registerToken, {
        expires: tokens.expired,
        path: '/auth/register',
        ...this.cookieOption,
      });

      res.redirect(`${this.configService.get(ENV.FRONT_URL)}/auth/signup`);
      return;
    }

    this.ResCookie(res, tokens);
    res.redirect(`${this.configService.get(ENV.FRONT_URL)}`);
  }

  @Public()
  @UseGuards(AuthGuard('register'))
  @Post('register')
  @HttpCode(200)
  async register(
    @User('user_idx') user_idx: number,
    @Body() data: RegisterDto,
    @Res() res: Response,
  ) {
    await this.authService.register(user_idx, data);

    res.clearCookie(registerToken, {
      path: '/auth/register',
      ...this.cookieOption,
    });
    res.send('저장되었습니다');
  }

  @ApiResponse({ status: 401, description: '인증되지 않은 유저' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiOperation({ summary: '로그아웃' })
  @ApiCookieAuth(accessToken)
  @Post('logout')
  @HttpCode(200)
  async logout(@Res() res: Response, @User() data: AtUser) {
    await this.authService.logout(data);
    res.clearCookie(accessToken, {
      ...this.cookieOption,
    });
    res.clearCookie(refreshToken, {
      ...this.cookieOption,
    });
    res.send('로그아웃에 성공하였습니다.');
  }

  @ApiResponse({ status: 401, description: '인증되지 않은 유저' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiOperation({
    summary: '토큰 재발급',
    description: 'accessToken이 만료되었을 때 refreshToken으로 재발급해줍니다.',
  })
  @ApiCookieAuth(refreshToken)
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(200)
  async refresh(@User() data: AtUser, @Res() res: Response) {
    const tokens = await this.authService.refresh(data);

    this.ResCookie(res, tokens);
    res.send('토큰 재발급에 성공하였습니다');
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

  @Get('/check')
  check() {
    return '성공';
  }
}
