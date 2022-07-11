import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ApplicationModule } from './application/application.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ApplicationModule, PrismaModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
