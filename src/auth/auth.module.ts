import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { EmailService } from 'src/email/email.service';

@Module({
  providers: [AuthService, AtStrategy, RtStrategy, EmailService],
  controllers: [AuthController],
})
export class AuthModule {}
