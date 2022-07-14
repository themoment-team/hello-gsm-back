import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';

@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService, PrismaService],
})
export class ApplicationModule {}
