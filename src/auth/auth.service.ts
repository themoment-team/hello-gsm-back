import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { verifyDto } from './dto';
import { AuthEmail } from './types/auth.email.type';

@Injectable()
export class AuthService {
  authEmail: Record<string, AuthEmail> = {};
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
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
      expiredAt: new Date(new Date().setMinutes(new Date().getMinutes() + 3)),
    };
    return '이메일 전송';
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
