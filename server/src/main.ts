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

  // Add health check endpoint for Render
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  const port = process.env.PORT || 3000;
  const server = await app.listen(port);

  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 CORS enabled for:`, [
    'http://localhost:8080',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean));
  console.log(`❤️  Health check available at: http://localhost:${port}/health`);

  // Graceful shutdown handling for Render
  process.on('SIGTERM', async () => {
    console.log('🚨 Received SIGTERM signal, starting graceful shutdown...');
    
    // Give some time for ongoing requests to complete
    setTimeout(async () => {
      await server.close();
      console.log('✅ HTTP server closed.');
      
      // Close any database connections or other resources here
      // If you're using TypeORM, Prisma, etc., close them here
      
      console.log('👋 Graceful shutdown completed');
      process.exit(0);
    }, 5000); // 5 second grace period
  });

  process.on('SIGINT', async () => {
    console.log('🚨 Received SIGINT signal, shutting down...');
    await server.close();
    process.exit(0);
  });

  // Handle uncaught exceptions and unhandled rejections
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

bootstrap();
