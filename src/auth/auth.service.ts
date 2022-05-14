import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ENV } from 'src/lib/env';
import { AtUser } from 'src/types';
import KakaoUserType from './types/kakao.user.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async kakaoLogin(user: KakaoUserType) {
    console.log(user);
  }

  async logout({ user_idx, accessToken }: AtUser): Promise<void> {
    await this.prisma.refresh_token.update({
      where: { user_idx: user_idx },
      data: { refresh_token: '' },
    });
    await this.prisma.access_token_blacklist.create({
      data: { user_idx: user_idx, access_token: accessToken },
    });
    return;
  }

  async refresh({ user_idx, email }: AtUser) {
    const tokens = await this.getTokens(email);
    const refresh_token = await bcrypt.hash(tokens.rt, 10);
    await this.prisma.refresh_token.update({
      where: { user_idx: user_idx },
      data: { refresh_token },
    });
    return tokens;
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
