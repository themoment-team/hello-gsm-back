import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminController } from './admin.controller';
import { ApplicationModule } from './application/application.module';

@Module({
  imports: [ApplicationModule, AuthModule],
  controllers: [AdminController],
  providers: [],
})
export class AdminModule {}
