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
import { AuthGuard } from '@nestjs/passport';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { User } from './decorators/user.decorator';
import { ExitDto } from './dto/exit.dto';
import { RtGuard } from './guards/rt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
  async kakaoLogin(@Req() req: Request) {
    return req.user;
  }

  @ApiResponse({ status: 401, description: '인증되지 않은 유저' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiOperation({ summary: '로그아웃' })
  @ApiCookieAuth('accessToken')
  @Post('logout')
  @HttpCode(200)
  async logout(@Res() res: Response, @User('email') email: string) {
    await this.authService.logout(email);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.send('로그아웃 완료');
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

  @ApiResponse({ status: 401, description: '인증되지 않은 유저' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiOperation({ summary: '탈퇴' })
  @ApiCookieAuth('accessToken')
  @Post('exit')
  @HttpCode(201)
  async exit(
    @Body() data: ExitDto,
    @User('email') email: string,
    @Res() res: Response,
  ) {
    await this.authService.exit(data, email);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.send();
  }
}
