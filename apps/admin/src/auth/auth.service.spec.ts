import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth.module';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({}), ConfigModule, PrismaModule, AuthModule],
      providers: [PrismaService, ConfigService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('accessToken test', async () => {
    const admin = {
      admin_idx: 1,
      id: 'id',
      password: '1234',
    };

    prisma.admin.findFirst = jest.fn().mockReturnValueOnce({
      ...admin,
      password: bcrypt.hashSync(admin.password, 10),
    });

    // const tokens = await service.login({
    //   id: admin.id,
    //   password: admin.password,
    // });
  });
});
