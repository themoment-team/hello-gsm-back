import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AdminModule } from './admin.module';

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
  await app.listen(3000);
}
bootstrap();
