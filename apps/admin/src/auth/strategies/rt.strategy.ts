import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from 'apps/admin/src/prisma/prisma.service';
import { ENV } from 'apps/admin/src/lib/env';
import { refreshToken } from 'apps/admin/src/utils/token.name';
import * as bcrypt from 'bcrypt';

type JwtPayload = {
  admin_idx: number;
};

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-rt') {
  constructor(private prisma: PrismaService) {
    const configService = new ConfigService();
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookie = req.cookies[refreshToken];
          if (!cookie) return null;
          return cookie;
        },
      ]),
      secretOrKey: configService.get(ENV.JWT_REFRESH_SECRET),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, { admin_idx }: JwtPayload) {
    if (!admin_idx) return null;

    const user = await this.prisma.admin.findFirst({ where: { admin_idx } });

    const refresh = await this.prisma.refresh_token.findFirst({
      where: { user_idx: admin_idx },
    });

    if (
      !user ||
      !refresh.refresh_token ||
      !bcrypt.compareSync(req.cookies[refreshToken], refresh.refresh_token)
    )
      return null;

    return { admin_idx };
  }
}
