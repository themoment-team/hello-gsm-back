import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from './dto/signup';
import { AuthEmail } from './types/auth.email.type';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  authEmails: AuthEmail[] = [];

  async signup(data: SignupDto) {
    if (data.password !== data.passwordConfirm) throw new BadRequestException();
    const user = await this.prisma.user.findFirst({
      where: { email: data.email },
    });
    if (user) throw new ConflictException();
    const code = Math.floor(Math.random() * (999_999 - 100_000)) + 100_000;
    // TODO email 전송
    this.authEmails.push({ email: data.email, code });
  }
}
