import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

type JwtPayload = {
  email: string;
};

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-rt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookie = req.cookies['refreshToken'];
          if (!cookie) return null;
          return cookie;
        },
      ]),
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    if (!payload.email) return false;
    const user = await this.prisma.user.findFirst({
      where: { email: payload.email },
      include: { token: true },
    });

    if (
      !user ||
      !bcrypt.compareSync(req.cookies['refreshToken'], user.token.refresh_token)
    )
      return false;
    return { ...payload, refreshToken: req.cookies['refreshToken'] };
  }
}
