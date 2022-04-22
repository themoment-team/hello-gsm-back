import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from './dto/signup';
import { AuthEmail } from './types/auth.email.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  authEmails: AuthEmail[] = [];

  async signup(data: SignupDto) {
    if (data.password !== data.passwordConfirm) throw new BadRequestException();
    const user = await this.prisma.user.findFirst({
      where: { email: data.email },
    });
    if (user) throw new ConflictException();
    const code = Math.floor(Math.random() * (999_999 - 100_000)) + 100_000;
    try {
      await this.emailService.userVerify(data.email, `${code}`);
    } catch (e) {
      throw new BadRequestException('존재하지 않는 이메일입니다');
    }

    this.authEmails.push({ email: data.email, code });
  }
}
