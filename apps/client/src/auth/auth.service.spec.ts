import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { AtStrategy } from './strategies/at.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { RegisterStrategy } from './strategies/register.strategy';
import { RtStrategy } from './strategies/rt.strategy';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({}), PrismaModule, ConfigModule],
      providers: [
        AuthService,
        AtStrategy,
        RtStrategy,
        KakaoStrategy,
        RegisterStrategy,
        PrismaService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
