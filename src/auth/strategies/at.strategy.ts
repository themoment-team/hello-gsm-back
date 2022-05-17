import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import { ENV } from 'src/lib/env';
import { accessToken } from 'src/utils/token.name';

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
          const cookie = req.cookies[accessToken];
          if (!cookie) return null;
          return cookie;
        },
      ]),
      secretOrKey: configService.get(ENV.JWT_ACCESS_SECRET),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, { user_idx }: JwtPayload) {
    const at = req.cookies[accessToken];
    const user = await this.prisma.user.findFirst({
      where: { user_idx },
    });

    if (!user) return false;

    const token = await this.prisma.access_token_blacklist.findFirst({
      where: {
        user_idx: user.user_idx,
        access_token: at,
      },
    });

    if (token) return false;
    return { user_idx: user.user_idx };
  }
}
