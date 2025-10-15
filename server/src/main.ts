import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS for both dev & production
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://localhost:5173',
      process.env.FRONTEND_URL, // ✅ Deployed frontend URL
    ].filter(Boolean),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 CORS enabled for:`, [
    'http://localhost:8080',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ]);
}
bootstrap();

