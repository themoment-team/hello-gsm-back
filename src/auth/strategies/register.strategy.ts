import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import { ENV } from 'src/lib/env';

type JwtPayload = {
  user_idx: number;
};

@Injectable()
export class RegisterStrategy extends PassportStrategy(Strategy, 'register') {
  constructor(private prisma: PrismaService) {
    const configService = new ConfigService();
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookie = req.cookies['registerToken'];

          if (!cookie) return null;
          return cookie;
        },
      ]),
      secretOrKey: configService.get(ENV.JWT_REGISTER_SECRET),
    });
  }

  async validate({ user_idx }: JwtPayload) {
    const user = await this.prisma.user.findFirst({
      where: { user_idx },
    });

    if (!user) return false;

    return { user_idx: user.user_idx };
  }
}
