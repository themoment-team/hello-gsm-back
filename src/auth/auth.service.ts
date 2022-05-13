import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerifyDataType } from './types/auth.email.type';
import * as bcrypt from 'bcrypt';
import { ENV } from 'src/lib/env';

@Injectable()
export class AuthService {
  authEmail: Record<string, VerifyDataType> = {};
  verifyPwd: Record<string, VerifyDataType> = {};

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async logout(email: string, accessToken: string): Promise<void> {
    const user = await this.prisma.user.findFirst({ where: { email } });
    await this.prisma.refresh_token.update({
      where: { user_idx: user.user_idx },
      data: { refresh_token: '' },
    });
    await this.prisma.access_token_blacklist.create({
      data: { user_idx: user.user_idx, access_token: accessToken },
    });
    return;
  }

  async refresh(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });
    const tokens = await this.getTokens(email);
    const refresh_token = await bcrypt.hash(tokens.rt, 10);
    await this.prisma.refresh_token.update({
      where: { user_idx: user.user_idx },
      data: { refresh_token },
    });
    return tokens;
  }

  // 탈퇴기능 일단 보류
  async exit() {
    return;
  }

  private async isEmailExist(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) throw new BadRequestException('존재하지 않는 사용자입니다');
    return user;
  }

  private async getTokens(email: string) {
    const [at, rt, atExpired, rtExpired] = await Promise.all([
      this.jwtService.sign(
        { email },
        {
          secret: this.configService.get(ENV.JWT_ACCESS_SECRET),
          expiresIn: 60 * 10,
        },
      ),
      this.jwtService.sign(
        { email },
        {
          secret: this.configService.get(ENV.JWT_REFRESH_SECRET),
          expiresIn: '1d',
        },
      ),
      new Date(new Date().setMinutes(new Date().getMinutes() + 10)),
      new Date(new Date().setDate(new Date().getDate() + 1)),
    ]);
    return { at, rt, atExpired, rtExpired };
  }
}
