import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Enhanced CORS for production
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://localhost:5173',
      'https://queue-frontend.onrender.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global prefix for API routes (optional)
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS enabled for: ${[
    'http://localhost:8080',
    'http://localhost:5173',
    'https://queue-frontend.onrender.com'
  ].join(', ')}`);
}
bootstrap();
