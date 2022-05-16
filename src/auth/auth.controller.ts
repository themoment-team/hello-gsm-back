import {
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
import { ENV } from 'src/lib/env';
import { AtUser } from 'src/types';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { User } from './decorators/user.decorator';
import { RtGuard } from './guards/rt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
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
      res.cookie('registerToken', tokens.registerToken, {
        httpOnly: true,
        expires: tokens.expired,
        domain: this.configService.get(ENV.DOMAIN),
      });
    } else {
      res.cookie('accessToken', tokens.at, {
        httpOnly: true,
        expires: tokens.atExpired,
        domain: this.configService.get(ENV.DOMAIN),
      });
      res.cookie('refreshToken', tokens.rt, {
        httpOnly: true,
        expires: tokens.rtExpired,
        domain: this.configService.get(ENV.DOMAIN),
      });
    }

    res.redirect(`${this.configService.get(ENV.FRONT_URL)}`);
  }

  @Post('register')
  async register() {}

  @ApiResponse({ status: 401, description: '인증되지 않은 유저' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiOperation({ summary: '로그아웃' })
  @ApiCookieAuth('accessToken')
  @Post('logout')
  @HttpCode(200)
  async logout(@Res() res: Response, @User() data: AtUser) {
    await this.authService.logout(data);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.send('로그아웃에 성공하였습니다.');
  }

  @ApiResponse({ status: 401, description: '인증되지 않은 유저' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiOperation({
    summary: '토큰 재발급',
    description: 'accessToken이 만료되었을 때 refreshToken으로 재발급해줍니다.',
  })
  @ApiCookieAuth('refreshToken')
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(200)
  async refresh(@User() data: AtUser, @Res() res: Response) {
    const tokens = await this.authService.refresh(data);
    res.cookie('accessToken', tokens.at, {
      httpOnly: true,
      expires: tokens.atExpired,
    });
    res.cookie('refreshToken', tokens.rt, {
      httpOnly: true,
      expires: tokens.rtExpired,
    });
    res.send('토큰 재발급에 성공하였습니다.');
  }
}
