import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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
import {
  emailConfirmDto,
  ModifyPwdDto,
  SigninDto,
  SignupDto,
  verifyDto,
} from './dto';
import { ExitDto } from './dto/exit.dto';
import { RtGuard } from './guards/rt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: '이메일 인증',
    description: '이메일을 받아 인증코드를 발송합니다',
  })
  @Public()
  @Post('/verify')
  @HttpCode(200)
  verify(@Body() data: verifyDto) {
    return this.authService.verify(data);
  }

  @ApiOperation({
    summary: '이메일 확인',
    description: '이메일확인을 위한 인증 코드를 받습니다.',
  })
  @Public()
  @Post('/emailconfirm')
  @HttpCode(200)
  async emailConfirm(@Body() data: emailConfirmDto, @Res() res: Response) {
    const { expiredAt, token } = await this.authService.emailConfirm(data);
    res.cookie('emailConfirm', token, { expires: expiredAt, httpOnly: true });
    res.send('인증 성공');
  }

  @ApiResponse({ status: 401, description: '인증되지 않은 유저' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiOperation({
    summary: '회원 가입',
    description: '이메일 인증을 하지 않으면 사용할 수 없습니다.',
  })
  @Public()
  @Post('/signup')
  @HttpCode(201)
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

  @ApiOperation({ summary: '로그인' })
  @Public()
  @Post('signin')
  @HttpCode(200)
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

  @ApiOperation({ summary: '비밀번호 변경을 위한 이메일 인증' })
  @Public()
  @HttpCode(200)
  @Post('/verifypwd')
  async verifyPassword(@Body() data: verifyDto) {
    await this.authService.verifyPassword(data);
    return '인증코드 전송 완료';
  }

  @ApiOperation({
    summary: '비밀번호 변경',
  })
  @Public()
  @Post('modifypwd')
  @HttpCode(201)
  async modifyPwd(@Body() data: ModifyPwdDto, @Res() res: Response) {
    await this.authService.modifypwd(data);
    res.send('비밀번호 변경 완료');
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
