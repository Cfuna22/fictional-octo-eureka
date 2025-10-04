import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueModule } from './queue/queue.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { WhatsAppController } from './whatsapp/whatsapp.controller';
import { WhatsAppModule } from './whatsapp/whatsapp.module';


@Module({
  imports: [QueueModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule,
    WhatsAppModule,
  ],
  controllers: [AppController, WhatsAppController],
  providers: [AppService],
})
export class AppModule {}
