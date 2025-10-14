import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
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
    HttpModule,
    WhatsAppModule,
    UssdModule,
  ],
  controllers: [AppController, WhatsAppController],
  providers: [AppService],
})
export class AppModule {}
