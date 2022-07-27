import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ENV } from 'apps/admin/src/lib/env';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login({ id, password }: LoginDto) {
    const user = await this.prisma.admin.findFirst({ where: { id } });

    if (!user) throw new BadRequestException('존재하지 않는 유저입니다');

    if (!bcrypt.compareSync(password, user.password))
      throw new BadRequestException('비밀번호가 올바르지 않습니다');

    const tokens = await this.getTokens(user.admin_idx);

    await this.saveRefresh(tokens, user.admin_idx);

    return tokens;
  }

  private async getTokens(admin_idx: number) {
    const [at, rt, atExpired, rtExpired] = await Promise.all([
      this.jwtService.signAsync(
        { user_idx: admin_idx },
        {
          secret: this.configService.get(ENV.JWT_ACCESS_SECRET),
          expiresIn: 60 * 5,
        },
      ),
      this.jwtService.signAsync(
        { user_idx: admin_idx },
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

  private async saveRefresh(tokens: any, user_idx: number) {
    const refresh_token = await bcrypt.hash(tokens.rt, 10);

    await this.prisma.refresh_token.update({
      where: { user_idx },
      data: { refresh_token },
    });
  }
}
