import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies';

@Module({
  imports: [JwtModule.register({}), PrismaModule, ConfigModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    ConfigService,
    AtStrategy,
    RtStrategy,
  ],
})
export class AuthModule {}
