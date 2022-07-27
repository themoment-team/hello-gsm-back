import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AdminModule } from './admin.module';
import { AtGuard } from './auth/guards';

async function bootstrap() {
  const app = await NestFactory.create(AdminModule, {
    cors: { origin: process.env.FRONT_URL, credentials: true },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalGuards(new AtGuard(new Reflector()));

  await app.listen(3000);
}
bootstrap();
