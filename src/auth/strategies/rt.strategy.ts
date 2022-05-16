import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ENV } from 'src/lib/env';

type JwtPayload = {
  user_idx: number;
};

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-rt') {
  constructor(private prisma: PrismaService) {
    const configService = new ConfigService();
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookie = req.cookies['refreshToken'];
          if (!cookie) return null;
          return cookie;
        },
      ]),
      secretOrKey: configService.get(ENV.JWT_REFRESH_SECRET),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, { user_idx }: JwtPayload) {
    if (!user_idx) return false;

    const user = await this.prisma.user.findFirst({ where: { user_idx } });

    const refresh = await this.prisma.refresh_token.findFirst({
      where: {
        user_idx,
        refresh_token: req.cookies['refreshToken'],
      },
    });

    if (!user || !refresh) return false;

    return {
      user_idx,
      accessToken: req.cookies['accessToken'],
    };
  }
}
