import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ApplicationModule } from './application/application.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ApplicationModule, AuthModule],
  controllers: [AdminController],
})
export class AdminModule {}
