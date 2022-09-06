import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'apps/client/src/prisma/prisma.service';
import { ENV } from 'apps/client/src/lib/env';
import { AtUser } from 'apps/client/src/types';
import KakaoUserType from './types/kakao.user.type';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async kakaoLogin(kakaoUser: KakaoUserType) {
    let user = await this.prisma.user.findFirst({
      where: { user_idx: kakaoUser.id },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          user_idx: kakaoUser.id,
          userImg: kakaoUser.kakao_account.profile.profile_image_url,
        },
      });
      await this.prisma.refresh_token.create({
        data: { user_idx: kakaoUser.id },
      });
    }

    if (!user.name || !user.birth || !user.gender || !user.cellphoneNumber)
      return this.getRegisterToken(kakaoUser.id);

    const tokens = await this.getTokens(Number(user.user_idx));

    await this.saveRefresh(tokens.rt, kakaoUser.id);

    return tokens;
  }

  async register(user_idx: number, data: RegisterDto) {
    if (!/^0\d{2}\d{3,4}\d{4}/g.test(data.cellphoneNumber))
      throw new BadRequestException('잘못된 전화번호 입력 방식입니다');
    if (new Date(data.birth).toString() === 'Invalid Date')
      throw new BadRequestException('잘못된 날짜 형식입니다');

    await this.prisma.user.update({
      where: { user_idx },
      data: {
        ...data,
        cellphoneNumber: data.cellphoneNumber.replace(/[- /]/g, ''),
        birth: new Date(data.birth),
      },
    });
  }

  async logout({ user_idx, accessToken }: AtUser): Promise<void> {
    await this.prisma.refresh_token.update({
      where: { user_idx },
      data: { refresh_token: null },
    });

    await this.prisma.access_token_blacklist.create({
      data: { access_token: accessToken },
    });
    return;
  }

  async refresh({ user_idx }: AtUser) {
    const tokens = await this.getTokens(user_idx);
    await this.saveRefresh(tokens.rt, user_idx);
    return tokens;
  }

  private async saveRefresh(refresh_token: string, user_idx: number) {
    await this.prisma.refresh_token.update({
      where: { user_idx },
      data: { refresh_token },
    });
  }

  private async getTokens(user_idx: number) {
    const [at, rt, atExpired, rtExpired] = await Promise.all([
      this.jwtService.signAsync(
        { user_idx },
        {
          secret: this.configService.get(ENV.JWT_ACCESS_SECRET),
          expiresIn: 60 * 5,
        },
      ),
      this.jwtService.signAsync(
        { user_idx },
        {
          secret: this.configService.get(ENV.JWT_REFRESH_SECRET),
          expiresIn: '1d',
        },
      ),
      new Date(new Date().setMinutes(new Date().getMinutes() + 5)),
      new Date(new Date().setDate(new Date().getDate() + 1)),
    ]);
    return { at, rt, atExpired, rtExpired };
  }

  private async getRegisterToken(user_idx: number) {
    const [registerToken, expired] = await Promise.all([
      this.jwtService.signAsync(
        { user_idx },
        {
          secret: this.configService.get(ENV.JWT_REGISTER_SECRET),
          expiresIn: '5m',
        },
      ),
      new Date(new Date().setMinutes(new Date().getMinutes() + 5)),
    ]);

    return { registerToken, expired };
  }
}
