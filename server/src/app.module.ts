import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { WhatsAppController } from './whatsapp/whatsapp.controller';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { UssdModule } from './ussd/ussd.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        
        // Supabase connection configuration
        if (databaseUrl) {
          const url = new URL(databaseUrl);
          return {
            type: 'postgres',
            host: url.hostname,
            port: parseInt(url.port),
            username: url.username,
            password: url.password,
            database: url.pathname.slice(1),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: configService.get('NODE_ENV') !== 'production', // Be careful with this in production
            ssl: {
              rejectUnauthorized: false,
            },
            extra: {
              ssl: {
                rejectUnauthorized: false,
              },
            },
          };
        }

        // Fallback to local development
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    HttpModule,
    WhatsAppModule,
    UssdModule,
  ],
  controllers: [AppController, WhatsAppController],
  providers: [AppService],
})
export class AppModule {}
