import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminController } from './admin.controller';
import { ApplicationModule } from './application/application.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ApplicationModule, AuthModule, PrismaModule],
  controllers: [AdminController],
  providers: [],
})
export class AdminModule {}
