import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'apps/admin/src/prisma/prisma.service';
import { Request } from 'express';
import { ENV } from 'apps/admin/src/lib/env';
import { adminAccessToken } from 'apps/admin/src/utils/token.name';

type JwtPayload = {
  user_idx: number;
};

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    const configService = new ConfigService();
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookie = req.cookies[adminAccessToken];
          if (!cookie) return null;
          return cookie;
        },
      ]),
      secretOrKey: configService.get(ENV.JWT_ACCESS_SECRET),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, { user_idx }: JwtPayload) {
    if (!user_idx) return null;

    const at = req.cookies[adminAccessToken];
    const user = await this.prisma.admin.findFirst({
      where: { admin_idx: user_idx },
    });

    if (!user) return null;

    const token = await this.prisma.access_token_blacklist.findFirst({
      where: {
        access_token: at,
      },
    });

    if (token) return null;
    return { admin_idx: user_idx, accessToken: at };
  }
}
