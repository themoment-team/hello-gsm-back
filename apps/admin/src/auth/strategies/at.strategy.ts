import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'apps/admin/src/prisma/prisma.service';
import { Request } from 'express';
import { ENV } from 'apps/admin/src/lib/env';
import { accessToken } from 'apps/admin/src/utils/token.name';

type JwtPayload = {
  admin_idx: number;
};

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    const configService = new ConfigService();
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookie = req.cookies[accessToken];
          if (!cookie) return null;
          return cookie;
        },
      ]),
      secretOrKey: configService.get(ENV.JWT_ACCESS_SECRET),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, { admin_idx }: JwtPayload) {
    if (!admin_idx) return null;

    const at = req.cookies[accessToken];
    const user = await this.prisma.admin.findFirst({
      where: { admin_idx },
    });

    if (!user) return null;

    const token = await this.prisma.access_token_blacklist.findFirst({
      where: {
        access_token: at,
      },
    });

    if (token) return null;
    return { admin_idx, accessToken: at };
  }
}
