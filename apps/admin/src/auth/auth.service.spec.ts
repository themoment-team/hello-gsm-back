import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth.module';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({}), ConfigModule, PrismaModule, AuthModule],
      providers: [PrismaService, ConfigService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('accessToken test', async () => {
    // given
    const admin = {
      admin_idx: -1,
      id: 'id',
      password: '1234',
    };

    prisma.admin.findFirst = jest.fn().mockReturnValueOnce({
      ...admin,
      password: bcrypt.hashSync(admin.password, 10),
    });

    prisma.refresh_token.update = jest.fn().mockReturnValueOnce({
      user_idx: admin.id,
      refresh_token: null,
    });

    configService.get = jest
      .fn()
      .mockReturnValueOnce('JWT_ACCESS_SECRET')
      .mockReturnValueOnce('JWT_REFRESH_SECRET');

    // when
    const tokens = await service.login({
      id: admin.id,
      password: admin.password,
    });

    // then
    const at = jwtService.verify(tokens.at, {
      secret: 'JWT_ACCESS_SECRET',
    });
    const rt = jwtService.verify(tokens.rt, {
      secret: 'JWT_REFRESH_SECRET',
    });

    expect(at.user_idx).toEqual(admin.admin_idx);
    expect(rt.user_idx).toEqual(admin.admin_idx);
  });
});
