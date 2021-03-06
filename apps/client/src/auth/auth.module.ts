import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { RegisterStrategy } from './strategies/register.strategy';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    AuthService,
    AtStrategy,
    RtStrategy,
    KakaoStrategy,
    RegisterStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
