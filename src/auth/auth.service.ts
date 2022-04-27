import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  emailConfirmDto,
  ModifyPwdDto,
  SigninDto,
  SignupDto,
  verifyDto,
} from './dto';
import { VerifyDataType } from './types/auth.email.type';
import * as bcrypt from 'bcrypt';
import { ExitDto } from './dto/exit.dto';

@Injectable()
export class AuthService {
  authEmail: Record<string, VerifyDataType> = {};
  verifyPwd: Record<string, VerifyDataType> = {};

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async verify(data: verifyDto): Promise<string> {
    const user = await this.prisma.user.findFirst({
      where: { email: data.email },
    });
    if (user) throw new ConflictException('같은 이메일이 존재합니다');

    const code = this.getVerifyCode();
    try {
      await this.emailService.userVerify(data.email, code);
    } catch (e) {
      Logger.error(`이메일 전송 실패 ${data.email}`);
      console.log(e);
      throw new InternalServerErrorException('이메일 전송 실패');
    }

    this.authEmail[data.email] = {
      code,
      expiredAt: new Date(new Date().setMinutes(new Date().getMinutes() + 10)),
      confirm: false,
    };
    return '이메일 전송';
  }

  async emailConfirm(data: emailConfirmDto) {
    const user = this.authEmail[data.email];
    if (!user) throw new BadRequestException('존재하지 않는 이메일입니다');
    if (user.code !== data.code)
      throw new BadRequestException('인증코드가 올바르지 않습니다.');
    if (user.expiredAt < new Date())
      throw new BadRequestException('인증 시간이 지났습니다');
    if (user.confirm) throw new ForbiddenException('이미 인증이 되었습니다');

    this.authEmail[data.email].confirm = true;

    const [token, expiredAt] = await Promise.all([
      this.jwtService.sign(
        { ...data },
        { expiresIn: 60 * 3, secret: this.configService.get('EMAIL_VERIFY') },
      ),
      new Date(new Date().setMinutes(new Date().getMinutes() + 3)),
    ]);
    return { token, expiredAt };
  }

  async signup(data: SignupDto, cookie: string) {
    if (await this.prisma.user.findFirst({ where: { email: data.email } }))
      throw new ConflictException('같은 이메일이 존재합니다.');
    if (!cookie) throw new BadRequestException('인증되지 않았습니다.');
    const token: any = this.jwtService.decode(cookie);

    if (data.email !== token.email || !this.authEmail[data.email])
      throw new BadRequestException('인증되지 않은 이메일입니다.');
    if (this.authEmail[data.email].expiredAt < new Date())
      throw new ForbiddenException('시간이 만료되었습니다.');
    if (!this.authEmail[data.email].confirm)
      throw new BadRequestException('인증되지 않았습니다.');
    if (this.authEmail[data.email].code !== token.code)
      throw new BadRequestException('토큰이 올바르지 않습니다.');
    if (data.password !== data.passwordConfirm)
      throw new BadRequestException('비밀번호가 올바르지 않습니다.');

    const hash = await bcrypt.hash(data.password, 10);

    await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hash,
        gender: data.gender,
        token: { create: { refresh_token: '' } },
      },
      include: { token: true },
    });

    delete this.authEmail[data.email];

    return;
  }

  async signin(data: SigninDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: data.email },
    });
    if (!user) throw new BadRequestException('유저를 찾을 수 없습니다.');

    if (!(await bcrypt.compare(data.password, user.password)))
      throw new BadRequestException('비밀번호가 올바르지 않습니다.');

    const tokens = await this.getTokens(user.email);
    const rt = await bcrypt.hash(tokens.rt, 10);
    await this.prisma.user.update({
      where: { email: data.email },
      include: { token: true },
      data: { token: { update: { refresh_token: rt } } },
    });
    return tokens;
  }

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

  async verifyPassword({ email }: verifyDto) {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) throw new BadRequestException('존재하지 않는 사용자입니다');

    const code = this.getVerifyCode();

    try {
      await this.emailService.userVerify(email, code);

      this.verifyPwd[email] = {
        code,
        confirm: false,
        expiredAt: new Date(
          new Date().setMinutes(new Date().getMinutes() + 10),
        ),
      };
    } catch (e) {
      throw new InternalServerErrorException('이메일 전송 실패');
    }
  }

  async modifypwd(data: ModifyPwdDto) {
    const user = this.verifyPwd[data.email];
    if (!user) throw new BadRequestException('존재하지 않는 이메일입니다');
    if (user.code !== data.code)
      throw new BadRequestException('인증코드가 올바르지 않습니다.');
    if (user.expiredAt < new Date())
      throw new BadRequestException('인증 시간이 지났습니다');

    if (data.password !== data.passwordConfirm)
      throw new BadRequestException('비밀번호가 올바르지 않습니다.');

    const hash = await bcrypt.hash(data.password, 10);

    await this.prisma.user.update({
      where: { email: data.email },
      data: { password: hash },
    });

    delete this.verifyPwd[data.email];
  }

  async exit({ password }: ExitDto, email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!(await bcrypt.compare(password, user.password)))
      throw new BadRequestException('비밀번호가 올바르지 않습니다.');

    try {
      await this.prisma.user.delete({ where: { idx: user.idx } });
      Logger.log(`${user.name} 탈퇴 성공`);
    } catch (e) {
      Logger.error('유저 삭제 실패');
      console.log(e);
      throw new InternalServerErrorException('회원 탈퇴 실패');
    }
  }

  private async getTokens(email: string) {
    const [at, rt, atExpired, rtExpired] = await Promise.all([
      this.jwtService.sign(
        { email },
        {
          secret: this.configService.get('JWT_ACCESS_SECRET'),
          expiresIn: 60 * 10,
        },
      ),
      this.jwtService.sign(
        { email },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: '1d',
        },
      ),
      new Date(new Date().setMinutes(new Date().getMinutes() + 10)),
      new Date(new Date().setDate(new Date().getDate() + 1)),
    ]);
    return { at, rt, atExpired, rtExpired };
  }

  private getVerifyCode(): string {
    let code = '';
    for (let i = 0; i < 6; i++) {
      const rand = this.rand(0, 2);
      switch (rand) {
        case 0:
          code += `${this.rand(0, 9)}`;
          break;
        case 1:
          code += String.fromCharCode(this.rand(65, 90));
          break;
        case 2:
          code += String.fromCharCode(this.rand(97, 122));
      }
    }
    return code;
  }

  private rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
