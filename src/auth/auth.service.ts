import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExitDto } from './dto';
import { VerifyDataType } from './types/auth.email.type';
import * as bcrypt from 'bcrypt';
import { ENV } from 'src/lib/env';

@Injectable()
export class AuthService {
  authEmail: Record<string, VerifyDataType> = {};
  verifyPwd: Record<string, VerifyDataType> = {};

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async logout(email: string): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      include: { token: true },
      data: { token: { update: { refresh_token: '' } } },
    });
    return;
  }

  async refresh(email: string) {
    const tokens = await this.getTokens(email);
    const rt = await bcrypt.hash(tokens.rt, 10);
    await this.prisma.user.update({
      where: { email },
      data: { token: { update: { refresh_token: rt } } },
    });
    return tokens;
  }

  async exit({ password }: ExitDto, email: string) {
    const user = await this.isEmailExist(email);
    await this.isMatchedPwd(password, user.password);

    try {
      await this.prisma.user.delete({ where: { idx: user.idx } });
      Logger.log(`${user.name} 탈퇴 성공`);
    } catch (e) {
      Logger.error('유저 삭제 실패');
      console.log(e);
      throw new InternalServerErrorException('회원 탈퇴 실패');
    }
  }

  private async isEmailExist(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) throw new BadRequestException('존재하지 않는 사용자입니다');
    return user;
  }

  private async isMatchedPwd(data: string, encrypted: string): Promise<void> {
    if (!(await bcrypt.compare(data, encrypted)))
      throw new BadRequestException('비밀번호가 올바르지 않습니다.');
    return;
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
