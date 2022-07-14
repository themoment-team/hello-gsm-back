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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({}), ConfigModule, PrismaModule, AuthModule],
      providers: [PrismaService, ConfigService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
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

    // when
    const tokens = await service.login({
      id: admin.id,
      password: admin.password,
    });

    // then
    const at = jwtService.decode(tokens.at);
    const rt = jwtService.decode(tokens.rt);

    if (typeof at === 'string') throw new Error('at does not matched');
    if (typeof rt === 'string') throw new Error('rt does not matched');

    expect(at.id).toEqual('id');
    expect(rt.id).toEqual('id');
  });
});
