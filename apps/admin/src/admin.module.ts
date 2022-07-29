import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ApplicationModule } from './application/application.module';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './lib/logger.middleware';

@Module({
  imports: [ApplicationModule, AuthModule],
  controllers: [AdminController],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
